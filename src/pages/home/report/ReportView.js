import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionView from './ReportActionsView';
import ReportActionCompose from './ReportActionCompose';
import {addAction, subscribeToReportTypingEvents, unsubscribeFromReportChannel} from '../../../libs/actions/Report';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import styles from '../../../styles/styles';

const propTypes = {
    // The ID of the report actions will be created for
    reportID: PropTypes.number.isRequired,

    // Whether or not this report is the one that is currently being viewed
    isActiveReport: PropTypes.bool.isRequired,

    isLoadingActions: PropTypes.bool,
};

const defaultProps = {
    isLoadingActions: false,
};

// This is a PureComponent so that it only re-renders when the reportID changes or when the report changes from
// active to inactive (or vice versa). This should greatly reduce how often comments are re-rendered.
class ReportView extends React.PureComponent {
    componentDidMount() {
        subscribeToReportTypingEvents(this.props.reportID);
    }

    componentWillUnmount() {
        unsubscribeFromReportChannel(this.props.reportID);
    }

    render() {
        return (
            <View style={[styles.chatContent]}>
                <ReportActionView
                    reportID={this.props.reportID}
                    isActiveReport={this.props.isActiveReport}
                    isLoadingActions={this.props.isLoadingActions}
                />
                <ReportActionCompose
                    onSubmit={text => addAction(this.props.reportID, text)}
                    reportID={this.props.reportID}
                />
                <KeyboardSpacer />
            </View>
        );
    }
}

ReportView.propTypes = propTypes;
ReportView.defaultProps = defaultProps;

export default ReportView;
