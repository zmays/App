import React, {Component, forwardRef} from 'react';
import {FlatList} from 'react-native';

const MAX_ITEMS_TO_INCREMENT = 50;

class InvertedFlatList extends Component {
    constructor(props) {
        super(props);

        // Start by showing the first 50 items
        this.startIndex = 0;
        this.stopIndex = 100;
        this.items = props.data.slice(this.startIndex, this.stopIndex);
    }

    componentDidMount() {
        this.props.forwardedRef(this.list);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data.length !== this.props.data.length) {
            // This is where you'd update the list...
            // but let's hold off on that for a second
        }
    }

    loadPrevious() {
        // Don't do anything as we are at the top of the list
        if (this.isUpdating || this.stopIndex === this.props.data.length) {
            return;
        }

        this.stopIndex = this.stopIndex + MAX_ITEMS_TO_INCREMENT < this.props.data.length ? this.stopIndex + MAX_ITEMS_TO_INCREMENT : this.props.data.length;
        this.startIndex += MAX_ITEMS_TO_INCREMENT;
        this.items = this.props.data.slice(this.startIndex, this.stopIndex);
        this.forceUpdate();
    }

    loadNext() {
        if (this.startIndex === 0) {
            // We are already at the bottom so don't do anything
            return;
        }

        this.stopIndex = this.stopIndex - MAX_ITEMS_TO_INCREMENT;
        this.startIndex = this.startIndex - MAX_ITEMS_TO_INCREMENT > 0 ? this.startIndex - MAX_ITEMS_TO_INCREMENT : 0;
        this.items = this.props.data.slice(this.startIndex, this.stopIndex);
        this.forceUpdate();
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
                onScroll={({nativeEvent}) => {
                    // We are close to the top of the list
                    const top = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y;
                    if (top >= nativeEvent.contentSize.height - 200 && top <= nativeEvent.contentSize.height) {
                        this.loadPrevious();
                    }

                    // We reached near the bottom of the list
                    if (nativeEvent.contentOffset.y >= 0 && nativeEvent.contentOffset.y <= 200) {
                        this.loadNext();
                    }
                }}
            />
        );
    }
}

export default forwardRef((props, ref) => (
    <InvertedFlatList {...props} forwardedRef={ref} />
));
