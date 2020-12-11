import React from 'react';
import {Animated, Dimensions, View, Image, ActivityIndicator, PanResponder, TouchableWithoutFeedback} from 'react-native';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';

class ZoomContainer extends React.Component {
    constructor(props) {
        super(props);
        this.pinchScale = new Animated.Value(1);
        this.baseScale = new Animated.Value(1);
        this.scale = Animated.multiply(this.baseScale, this.pinchScale);
        this.lastScale = 1;

        this.onPinch = Animated.event(
            [
                {nativeEvent: {scale: this.pinchScale}},
            ],
            {
                useNativeDriver: false,
            }
        );

        this.windowWidth = Dimensions.get('window').width;
        this.windowHeight = Dimensions.get('window').height;

        this.pan = new Animated.ValueXY();
        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                this.pan.setOffset({
                    x: this.pan.x._value,
                    y: this.pan.y._value
                });
            },
            onPanResponderMove: Animated.event([
                null,
                {dx: this.pan.x, dy: this.pan.y}
            ],
            {
                useNativeDriver: false,
            }),
            onPanResponderRelease: () => {
                this.pan.flattenOffset();
            },
        });

        this.state = {
            didImageLoad: true,
            imageHeight: null,
            imageWidth: null,
        };

        this.imageFetched = false;
    }

    componentDidMount() {
        Image.getSize(this.props.url, (width, height) => {
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
                <View>
                    <ActivityIndicator />
                </View>
            );
        }

        return (
            <TouchableWithoutFeedback>
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
                                    {translateX: this.pan.x},
                                    {translateY: this.pan.y},
                                ],
                            }}
                            {...this.panResponder.panHandlers}
                        />
                    </Animated.View>
                </PinchGestureHandler>
            </TouchableWithoutFeedback>
        );
    }
}

export default ZoomContainer;
