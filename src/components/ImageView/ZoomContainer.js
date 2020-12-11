import React from 'react';
import {Animated, Dimensions, View, Image, ActivityIndicator} from 'react-native';
import {PinchGestureHandler, PanGestureHandler, State} from 'react-native-gesture-handler';

class ZoomContainer extends React.Component {
    constructor(props) {
        super(props);

        this.baseScale = new Animated.Value(1);
        this.pinchScale = new Animated.Value(1);
        this.scale = Animated.multiply(this.baseScale, this.pinchScale);
        this.lastScale = 1;

        this.onPinch = Animated.event(
            [{
                nativeEvent: {scale: this.pinchScale},
            }],
            {useNativeDriver: false}
        );

        this.translateX = new Animated.Value(0);
        this.translateY = new Animated.Value(0);
        this.lastOffset = {x: 0, y: 0};
        this.onPanGestureEvent = Animated.event(
            [{
                nativeEvent: {
                    translationX: this.translateX,
                    translationY: this.translateY,
                },
            }],
            {useNativeDriver: false}
        );

        this.state = {
            didImageLoad: false,
            imageHeight: null,
            imageWidth: null,
        };
    }

    componentDidMount() {
        Image.getSize(this.props.url, (width, height) => {
            const windowWidth = Dimensions.get('window').width;
            let baseScale = 1;

            if (windowWidth < width) {
                baseScale = (windowWidth - 100) / width;
            }

            this.lastScale = baseScale;
            this.baseScale.setValue(baseScale);

            this.setState({
                didImageLoad: true,
                imageHeight: height,
                imageWidth: width,
            });
        });

        // Prevent listeners for touchstart so we can prevent default browser zoom
        // behavior which zooms in the whole page. Not applicable on mobile.
        if (this.image && this.image.hasOwnProperty('addEventListener')) {
            this.image.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, {passive: false});
        }
    }

    render() {
        if (!this.state.didImageLoad) {
            return (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size="large" color="#000000" />
                </View>
            );
        }

        return (
            <PanGestureHandler
                onGestureEvent={this.onPanGestureEvent}
                onHandlerStateChange={(event) => {
                    if (event.nativeEvent.oldState === State.ACTIVE) {
                        this.lastOffset.x += event.nativeEvent.translationX;
                        this.lastOffset.y += event.nativeEvent.translationY;
                        this.translateX.setOffset(this.lastOffset.x);
                        this.translateX.setValue(0);
                        this.translateY.setOffset(this.lastOffset.y);
                        this.translateY.setValue(0);
                    }
                }}
            >
                <PinchGestureHandler
                    onGestureEvent={this.onPinch}
                    onHandlerStateChange={(event) => {
                        if (event.nativeEvent.oldState === State.ACTIVE) {
                            this.lastScale *= event.nativeEvent.scale;
                            this.baseScale.setValue(this.lastScale);
                            this.pinchScale.setValue(1);
                        }
                    }}
                >
                    <Animated.View
                        style={{
                            backgroundColor: 'black',
                            overflow: 'hidden',
                            alignItems: 'center',
                            flex: 1,
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                        }}
                        collapsable={false}
                    >
                        <Animated.Image
                            ref={el => this.image = el}
                            source={{uri: this.props.url}}
                            style={{
                                width: this.state.imageWidth,
                                height: this.state.imageHeight,
                                transform: [
                                    {scale: this.scale},
                                    {translateX: this.translateX},
                                    {translateY: this.translateY},
                                ],
                            }}
                        />
                    </Animated.View>
                </PinchGestureHandler>
            </PanGestureHandler>
        );
    }
}

export default ZoomContainer;
