// We should still use Onyx as the single source of truth to set a route and we can still use react router for this as
// well. This way the web code does not have to change to drastically and will just be cleaned up a bit. but we will
// move things to a more programattic navigation style.

// If we are on web then we should not need to use react-navigation at all and in fact probably don't want to, but
// instead will use a split pane navigation that essentially have a main view and a side bar view. This will probably
// also be used by iPad

// Mobile web could maybe use react-navigation... so we can still base this on Dimensions

import React from 'react';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import NavigationContainer from './NavigationContainer';

const RootNavigator = props => (
    <NavigationContainer

        // This can be used by react-navigation to initialize the state. It's not a plain route but a bit more
        // complex and possibly not very useful.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        initialState={null}
        onStateChange={(state) => {
            console.debug(state);
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

export default compose(
    withOnyx({
        currentRoute: {
            key: ONYXKEYS.CURRENT_ROUTE,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(RootNavigator);
