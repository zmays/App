import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';
import styles, {getWidthAndHeightStyle} from '../../styles/styles';
import variables from '../../styles/variables';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,

    modalCallback: PropTypes.func,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    modalCallback: null,
};

class ImageView extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            imageWidth: 100,
            imageHeight: 100,
        };

        // Use the default double click interval from the ImageZoom library
        // https://github.com/ascoders/react-native-image-zoom/blob/master/src/image-zoom/image-zoom.type.ts#L79
        this.doubleClickInterval = 175;
        this.imageZoomScale = 1;
        this.lastClickTime = 0;
    }

    render() {
        const modalCallback = this.props.modalCallback ?? null;

        // Default windowHeight accounts for the modal header height
        const windowHeight = this.props.windowHeight - variables.contentHeaderHeight;
        return (
            <View
                style={[
                    styles.w100,
                    styles.h100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    styles.overflowHidden,
                ]}
            >
                <ImageZoom
                    ref={el => this.zoom = el}
                    cropWidth={this.props.windowWidth}
                    cropHeight={windowHeight}
                    imageWidth={this.state.imageWidth}
                    imageHeight={this.state.imageHeight}
                    onStartShouldSetPanResponder={(e) => true}
                    // enableSwipeDown
                    // swipeDownThreshold={10}
                    onMoveShouldSetPanResponder={(e, gestureState) => {
                        const isDoubleClick = new Date().getTime() - this.lastClickTime <= this.doubleClickInterval;
                        this.lastClickTime = new Date().getTime();

                        console.log(`joetest event touches: ${e.nativeEvent.touches.length}`);
                        console.log(`joetest zoom: ${this.imageZoomScale}`);
                        console.log(`joetest changed touches: ${e.nativeEvent.changedTouches.length}`);
                        console.log(`joetest gesture state active touches: ${gestureState.numberActiveTouches}`);

                        // Let ImageZoom handle the event if the tap is more than one touchPoint or if we are zoomed in
                        if (e.nativeEvent.touches.length !== 1 || this.imageZoomScale !== 1) {
                            console.log('joetest returning true');
                            return true;
                        }

                        // When we have a double click and the zoom scale is 1 then programmatically zoom the image
                        // but let the tap fall through to the parent so we can register a swipe down to dismiss
                        if (isDoubleClick) {
                            this.zoom.centerOn({
                                x: 0,
                                y: 0,
                                scale: 2,
                                duration: 100,
                            });
                        }

                        // We must be either swiping down or double tapping since we are at zoom scale 1
                        console.log('joetest returning false');
                        if (modalCallback) {
                            console.log('modalCallback');
                            modalCallback();
                        } else {
                            console.log('not modalCallback');
                        }

                        return false;
                    }}
                    onPanResponderTerminationRequest={(e, state) => {
                        console.log(`joetest termination request`);
                    }}
                    onMove={({type, scale, positionX, positionY, zoomCurrentDistance}) => {
                        console.log(`joetest onMove setting scale ${scale}, positionX ${positionX}, positionY ${positionY}, zcd ${zoomCurrentDistance}`);
                        this.imageZoomScale = scale;
                        if (scale === 1 && modalCallback && type === 'onPanResponderRelease') {
                            modalCallback();
                        }
                    }}
                    // onSwipeDown={() => {
                    //     console.log('joetest onSwipeDown');
                    // }}
                >
                    <ImageWithSizeCalculation
                        style={getWidthAndHeightStyle(this.state.imageWidth, this.state.imageHeight)}
                        url={this.props.url}
                        onMeasure={({width, height}) => {
                            let imageWidth = width;
                            let imageHeight = height;

                            if (width > this.props.windowWidth || height > windowHeight) {
                                const scaleFactor = Math.max(width / this.props.windowWidth, height / windowHeight);
                                imageHeight = height / scaleFactor;
                                imageWidth = width / scaleFactor;
                            }

                            this.setState({imageHeight, imageWidth});
                        }}
                    />
                </ImageZoom>
            </View>
        );
    }
}

ImageView.defaultProps = defaultProps;
ImageView.propTypes = propTypes;
ImageView.displayName = 'ImageView';

export default withWindowDimensions(ImageView);
