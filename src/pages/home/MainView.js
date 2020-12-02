import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ReportView from './report/ReportView';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/StyleSheet';
import {withRouter} from '../../libs/Router';
import compose from '../../libs/compose';

const propTypes = {
    // This comes from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* Onyx Props */

    // List of reports to display
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.string,
    })),
};

const defaultProps = {
    reports: {},
};

class MainView extends Component {
    render() {
        const reportIDInUrl = this.props.match.params.reportID;

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        let activeReportID;
        const reportStyles = _.reduce(this.props.reports, (memo, report) => {
            const isActiveReport = reportIDInUrl === String(report.reportID);
            const finalData = {...memo};
            let reportStyle;

            if (isActiveReport) {
                activeReportID = String(report.reportID);
                reportStyle = [styles.dFlex, styles.flex1];
            } else {
                reportStyle = [styles.dNone];
            }

            finalData[report.reportID] = [reportStyle];
            return finalData;
        }, {});

        const reportsToDisplay = _.filter(this.props.reports, report => (
            report.isPinned
                || report.unreadActionCount > 0
                || String(report.reportID) === reportIDInUrl
        ));
        return (
            <>
                {_.map(reportsToDisplay, report => (
                    <View
                        key={report.reportID}
                        style={reportStyles[report.reportID]}
                    >
                        <ReportView
                            reportID={report.reportID}
                            isActiveReport={report.reportID === activeReportID}
                        />
                    </View>
                ))}
            </>
        );
    }
}

MainView.propTypes = propTypes;
MainView.defaultProps = defaultProps;

export default compose(
    withRouter,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(MainView);
