import React from 'react';
import {View, Modal, StyleSheet, TouchableOpacity, Image} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction, subscribeToReportTypingEvents, unsubscribeToReportTypingEvents} from '../../../libs/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles, {colors} from '../../../styles/StyleSheet';
import EmojiSelector from 'react-native-emoji-selector';
import paperClipIcon from '../../../../assets/images/icon-paper-clip.png';
import TextInputFocusable from '../../../components/TextInputFocusable';
import emojiIcon from '../../../../assets/images/Emoji.png';
import sendIcon from '../../../../assets/images/icon-send.png';
import ReportTypingIndicator from './ReportTypingIndicator';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    // Whether or not this report is the one that is currently being viewed
    isActiveReport: PropTypes.bool.isRequired,
};

// This is a PureComponent so that it only re-renders when the reportID changes or when the report changes from
// active to inactive (or vice versa). This should greatly reduce how often comments are re-rendered.
class ReportView extends React.PureComponent {
    constructor() {
        super();

        this.showHideEmojiPicker = this.showHideEmojiPicker.bind(this);
        this.onEmojiSelected = this.onEmojiSelected.bind(this);

        this.state = {
            shouldShowEmojiPicker: false
        };
    }

    componentDidMount() {
        if (this.props.reportID) {
            subscribeToReportTypingEvents(this.props.reportID);
        }
    }

    componentWillUnmount() {
        if (this.props.reportID) {
            unsubscribeToReportTypingEvents(this.props.reportID);
        }
    }

    showHideEmojiPicker() {
        this.setState(prevState => ({shouldShowEmojiPicker: !prevState.shouldShowEmojiPicker}));
    }

    onEmojiSelected(emoji) {
        debugger;
        this.showHideEmojiPicker();
        console.log(emoji);
    }

    render() {
        // Only display the compose form for the active report because the form needs to get focus and
        // calling focus() on 42 different forms doesn't work
        const shouldShowComposeForm = this.props.isActiveReport;
        const stylez = StyleSheet.create({
            centeredView: {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 22
            },
            modalView: {
                margin: 20,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                maxHeight: 100,
                maxWidth: 50,
            },
        });
        return (
            <View style={[styles.chatContent]}>
                <ReportActionView
                    reportID={this.props.reportID}
                    isActiveReport={this.props.isActiveReport}
                />

                {shouldShowComposeForm && (
                    <ReportActionCompose
                        onSubmit={text => addAction(this.props.reportID, text)}
                        reportID={this.props.reportID}
                        showHideEmojiPicker={this.showHideEmojiPicker}
                    />
                )}

                {this.state.shouldShowEmojiPicker && (
                    <View style={[styles.chatItemCompose]}>
                        <View style={[
                            this.state.isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                            styles.chatItemComposeBox,
                            styles.flexRow
                        ]}
                        >
                            <EmojiSelector
                                onEmojiSelected={(emoji) => {debugger; console.log(emoji);}}
                            />;
                        </View>
                    </View>
                )}

                <KeyboardSpacer />
            </View>
        );
    }
}

ReportView.propTypes = propTypes;

export default ReportView;
