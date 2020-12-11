import React from 'react';
import {View, useWindowDimensions} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import CustomStatusBar from '../CustomStatusBar';
import {getSafeAreaPadding, colors} from '../../styles/StyleSheet';

const WIDTH_BREAKPOINT = 1000;

const Modal = props => {
    const windowDimensions = useWindowDimensions();
    const isSmallScreen = windowDimensions.width < WIDTH_BREAKPOINT;

    const borderRadiusStyles = {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    };

    const shadowStyles = {
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    };

    let modalStyle;
    let modalContainerStyle;
    let swipeDirection;
    let animationIn;
    let animationOut;
    let needsSafeAreaPadding = false;

    switch (props.type) {
        case 'centered':
            const marginVertical = windowDimensions.height * 0.025;
            modalStyle = {
                alignItems: 'center',
            };
            modalContainerStyle = {
                ...shadowStyles,
                flex: 1,
                marginTop: isSmallScreen ? 0 : marginVertical,
                marginBottom: isSmallScreen ? 0 : marginVertical,
                borderRadius: isSmallScreen ? 0 : 20,
                overflow: 'hidden',
                width: isSmallScreen ? '100%' : '95%',
            };

            swipeDirection = undefined;
            animationIn = 'fadeIn';
            animationOut = 'fadeOut';
            needsSafeAreaPadding = true;
            break;
        case 'rightDocked':
            modalStyle = {
                alignItems: 'flex-end',
            };
            modalContainerStyle = {
                ...shadowStyles,
                width: 350,
                height: '100%',
            };
            swipeDirection = 'right';
            animationIn = 'slideInRight';
            animationOut = 'slideOutRight';
            needsSafeAreaPadding = true;
        break;
        case 'leftDocked':
            modalStyle = {
                alignItems: 'flex-start',
            };
            modalContainerStyle = {
                ...shadowStyles,
                width: 350,
                height: '100%',
            };
            swipeDirection = 'left';
            animationIn = 'slideInLeft';
            animationOut = 'slideOutLeft';
            needsSafeAreaPadding = true;
        break;
        case 'bottomDocked':
            modalStyle = {
                justifyContent: 'flex-end',
            };
            modalContainerStyle = {
                ...borderRadiusStyles,
                ...shadowStyles,
                minHeight: 200,
            };
            swipeDirection = 'down';
            animationIn = 'slideInUp';
            animationOut = 'slideOutDown';
            break;
        case 'fullPage':
            modalStyle = {
            };
            modalContainerStyle = {
                ...borderRadiusStyles,
                ...shadowStyles,
                flex: 1,
            };
            swipeDirection = 'down';
            animationIn = 'slideInUp';
            animationOut = 'slideOutDown';
            needsSafeAreaPadding = true;
            break;
        default:
            modalStyle = {};
            modalContainerStyle = {};
            swipeDirection = 'down';
            animationIn = 'slideInUp';
            animationOut = 'slideOutDown';
    }

    return (
        <ReactNativeModal
            onBackdropPress={props.onClose}
            onBackButtonPress={props.onClose}
            onSwipeComplete={props.onClose}
            swipeDirection={swipeDirection}
            isVisible={props.isVisible}
            backdropOpacity={0.3}
            backdropTransitionOutTiming={0}
            style={{
                margin: 0,
                ...modalStyle,
            }}
            animationIn={animationIn}
            animationOut={animationOut}
        >
            <CustomStatusBar />
            <SafeAreaInsetsContext.Consumer>
                {insets => {
                    const {paddingTop, paddingBottom} = getSafeAreaPadding(insets);
                    return (
                        <View
                            style={{
                                paddingBottom,
                                ...modalContainerStyle,
                                paddingTop: needsSafeAreaPadding ? paddingTop : 20,
                            }}
                        >
                            {props.children}
                        </View>
                    )
                }}
            </SafeAreaInsetsContext.Consumer>
        </ReactNativeModal>
    );
};

export default Modal;
