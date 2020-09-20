import React, {Component, forwardRef} from 'react';
import {FlatList} from 'react-native';

const MAX_ITEMS_TO_INCREMENT = 10;
const LIST_SIZE = 50;
const THRESHOLD = 200;

class InvertedFlatList extends Component {
    constructor(props) {
        super(props);

        // Start by showing the first 50 items
        this.startIndex = 0;
        this.stopIndex = LIST_SIZE;
        this.items = props.data.slice(this.startIndex, this.stopIndex);

        this.state = {
            isUpdating: false,
        };
    }

    componentDidMount() {
        this.props.forwardedRef(this.list);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data.length === this.props.data.length) {
            return;
        }

        this.updateItems();
    }

    updateItems() {
        if (this.state.isUpdating) {
            return;
        }

        this.items = this.props.data.slice(this.startIndex, this.stopIndex);
        this.setState({isUpdating: true}, () => this.setState({isUpdating: false}));
    }

    loadPrevious() {
        // If the overall list size is less than the window size
        // then we already know there's nothing more to load
        if (this.props.data.length < LIST_SIZE) {
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
                showsVerticalScrollIndicator={false}
                onScroll={({nativeEvent}) => {
                    // We are close to the top of the list
                    const top = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y;
                    if (top >= nativeEvent.contentSize.height - THRESHOLD && top <= nativeEvent.contentSize.height) {
                        this.loadPrevious();
                        return;
                    }

                    // We reached near the bottom of the list
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
