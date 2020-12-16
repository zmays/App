import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ReportView from './report/ReportView';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import {withRouter} from '../../libs/Router';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
import {redirect} from '../../libs/actions/App';

const propTypes = {
    // This comes from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* Onyx Props */

    // List of reports to display
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),
};

const defaultProps = {
    reports: {},
};

class MainView extends Component {
    componentDidMount() {
        const reportID = parseInt(this.props.match.params.reportID, 10);
        this.canViewReport(reportID);
    }

    componentDidUpdate(prevProps) {
        const previousReportID = parseInt(prevProps.match.params.reportID, 10);
        const newReportID = parseInt(this.props.match.params.reportID, 10);

        if (previousReportID !== newReportID) {
            this.canViewReport(newReportID);
        }
    }

    /**
     * Check to see if this report exists in the report list and if not redirect to 404.
     *
     * @param {Number} reportID
     */
    canViewReport(reportID) {
        // If we do not have a valid reportID then we cannot check for access.
        if (_.isNaN(reportID)) {
            return;
        }

        // If the user has this report in their report list then we assume they can access it.
        if (_.find(this.props.reports, report => report.reportID === reportID)) {
            return;
        }

        // Report doesn't exist redirect to /404.
        redirect(ROUTES.NOT_FOUND);
    }

    render() {
        const reportIDInUrl = parseInt(this.props.match.params.reportID, 10);
        const reportToDisplay = _.find(this.props.reports, report => (
            report.reportID === reportIDInUrl
        ));

        if (!reportToDisplay) {
            return null;
        }

        return (
            <View
                key={reportToDisplay.reportID}
                style={[styles.dFlex, styles.flex1]}
            >
                <ReportView
                    reportID={reportToDisplay.reportID}
                    isLoadingActions={reportToDisplay.loadingActions}
                />
            </View>
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
