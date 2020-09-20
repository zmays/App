import React, {Component, forwardRef} from 'react';
import {FlatList} from 'react-native';

const MAX_ITEMS_TO_INCREMENT = 10;
const MAX_LIST_SIZE = 50;
const THRESHOLD = 200;

/**
 * This component handles very large lists that need to be inverted.
 * We are not using FlatList by itself and need this abstraction since
 * FlatList does not work correctly when inverted on web only. One
 * downside is that we must hide the scrollbars since we are only ever
 * rendering an item count specified by MAX_LIST_SIZE.
 */
class InvertedFlatList extends Component {
    constructor(props) {
        super(props);

        // Start by showing the first 50 items
        this.startIndex = 0;
        this.stopIndex = MAX_LIST_SIZE;
        this.data = props.data;
        this.items = props.data.slice(this.startIndex, this.stopIndex);

        this.state = {
            isUpdating: false,
        };
    }

    componentDidMount() {
        this.props.forwardedRef({
            // This enables us to programattically scroll to the bottom of
            // the list while any number of items are shown in the list by
            // using a ref in the parent component.
            scrollToBottom: () => {
                this.startIndex = 0;
                this.stopIndex = MAX_LIST_SIZE;
                this.updateItems();
                this.list.scrollToOffset({y: 0, animated: false});
            },
        });
    }

    componentDidUpdate(prevProps) {
        // Required so that new items that appear via props will make it into
        // the list as they will not cause a re-render by default.
        if (prevProps.data.length === this.props.data.length) {
            return;
        }

        this.updateItems();
    }

    /**
     * Update the items. The setState is largely here to trigger a re-render.
     */
    updateItems() {
        if (this.state.isUpdating) {
            return;
        }

        this.items = this.props.data.slice(this.startIndex, this.stopIndex);
        this.setState({isUpdating: true}, () => this.setState({isUpdating: false}));
    }

    /**
     * Renders previous items in the list on scroll up
     */
    loadPrevious() {
        // If the overall list size is less than the window size
        // then we already know there's nothing more to load
        if (this.props.data.length < MAX_LIST_SIZE) {
            return;
        }

        // Don't do anything as we are at the top of the list
        if (this.stopIndex === this.props.data.length) {
            return;
        }

        this.stopIndex = this.stopIndex + MAX_ITEMS_TO_INCREMENT < this.props.data.length
            ? this.stopIndex + MAX_ITEMS_TO_INCREMENT
            : this.props.data.length;

        this.startIndex += MAX_ITEMS_TO_INCREMENT;
        this.updateItems();
    }

    /**
     * Renders next items in the list on scroll down.
     *
     * @param {Number} y - used to prevent a "stuck" scroll state
     */
    loadNext(y) {
        // We are already at the bottom so don't do anything
        if (this.startIndex === 0) {
            return;
        }

        this.stopIndex -= MAX_ITEMS_TO_INCREMENT;
        this.startIndex = this.startIndex - MAX_ITEMS_TO_INCREMENT > 0
            ? this.startIndex - MAX_ITEMS_TO_INCREMENT
            : 0;

        this.updateItems();

        // It's possible up at the bottom of the scrollable area and have more items to display.
        // This can leave us stuck at y === 0, but unable to append more items to the list since
        // there's nowhere left to scroll to. This is caused by very fast scrolling so we'll
        // push the scroll position out of the threshold so the user can resume scrolling normally.
        if (y === 0) {
            this.list.scrollToOffset({offset: THRESHOLD, animated: false});
        }
    }

    render() {
        return (
            <FlatList
                ref={el => this.list = el}
                inverted
                contentContainerStyle={this.props.contentContainerStyle}
                data={this.items}
                keyExtractor={this.props.keyExtractor}
                renderItem={this.props.renderItem}

                // We must disable the scroll indicator since it looks
                // pretty janky. Our list is always a set size so updating
                // it will make the scrollbars appear to jump around.
                showsVerticalScrollIndicator={false}
                onScroll={({nativeEvent}) => {
                    // We are in range with the top of the list so we'll show the previous items
                    const top = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y;
                    if (top >= nativeEvent.contentSize.height - THRESHOLD && top <= nativeEvent.contentSize.height) {
                        this.loadPrevious();
                        return;
                    }

                    // We are in range with the bottom of the list so we'll show the next items
                    if (nativeEvent.contentOffset.y >= 0 && nativeEvent.contentOffset.y <= THRESHOLD) {
                        this.loadNext(nativeEvent.contentOffset.y);
                    }
                }}
            />
        );
    }
}

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} forwardedRef={ref} />
));
