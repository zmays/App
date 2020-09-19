import React, {Component, forwardRef} from 'react';
import {FlatList} from 'react-native';

const MAX_ITEMS_TO_INCREMENT = 10;

class InvertedFlatList extends Component {
    constructor(props) {
        super(props);

        // Start by showing the first 50 items
        this.startIndex = 0;
        this.stopIndex = 50;
        this.items = props.data.slice(this.startIndex, this.stopIndex);

        this.state = {
            isUpdating: false,
        };
    }

    componentDidMount() {
        this.props.forwardedRef(this.list);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data.length !== this.props.data.length) {
            this.updateItems();
        }
    }

    updateItems() {
        if (this.state.isUpdating) {
            console.log('cant update already updating');
            return;
        }

        this.items = this.props.data.slice(this.startIndex, this.stopIndex);
        this.setState({isUpdating: true}, () => this.setState({isUpdating: false}));
    }

    loadPrevious() {
        console.log('loadPrevious');
        // Don't do anything as we are at the top of the list
        if (this.stopIndex === this.props.data.length) {
            return;
        }

        this.stopIndex = this.stopIndex + MAX_ITEMS_TO_INCREMENT < this.props.data.length ? this.stopIndex + MAX_ITEMS_TO_INCREMENT : this.props.data.length;
        this.startIndex += MAX_ITEMS_TO_INCREMENT;
        this.updateItems();
    }

    loadNext() {
        console.log('loadNext');
        console.log('this.startIndex: ', this.startIndex);

        if (this.startIndex === 0) {
            // We are already at the bottom so don't do anything
            return;
        }

        this.stopIndex = this.stopIndex - MAX_ITEMS_TO_INCREMENT;
        this.startIndex = this.startIndex - MAX_ITEMS_TO_INCREMENT > 0 ? this.startIndex - MAX_ITEMS_TO_INCREMENT : 0;
        console.log({
            startIndex: this.startIndex,
            stopIndex: this.stopIndex,
        })
        this.updateItems();
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
                // showsVerticalScrollIndicator={false}
                onScroll={({nativeEvent}) => {
                    console.log('y: ', nativeEvent.contentOffset.y);

                    // We are close to the top of the list
                    const top = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y;
                    console.log('top: ', top);
                    if (top >= nativeEvent.contentSize.height - 200 && top <= nativeEvent.contentSize.height) {
                        this.loadPrevious();
                        return;
                    }

                    // We reached near the bottom of the list
                    if (nativeEvent.contentOffset.y >= 0 && nativeEvent.contentOffset.y <= 200) {
                        this.loadNext();
                        return;
                    }

                    // console.log(nativeEvent.contentOffset.y);

                    console.log('Not updating');
                    // console.log({
                    //     top: nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y,
                    //     contentSize: nativeEvent.contentSize.height,
                    //     contentOffsetY: nativeEvent.contentOffset.y,
                    //     layoutMeasurementHeight: nativeEvent.layoutMeasurement.height,
                    // });
                }}
            />
        );
    }
}

export default forwardRef((props, ref) => (
    <InvertedFlatList {...props} forwardedRef={ref} />
));
