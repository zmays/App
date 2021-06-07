import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles, {getNavigationDrawerStyle, getNavigationDrawerType} from '../../../styles/styles';
import compose from '../../compose';

// Screens
import WorkspaceSidebar from '../../../pages/WorkspaceSidebar';
import WorkspacePage from '../../../pages/WorkspacePage';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const Drawer = createDrawerNavigator();

const WorkspaceDrawerNavigator = props => (
    <Drawer.Navigator
        openByDefault={props.isSmallScreenWidth}
        drawerType={getNavigationDrawerType(props.isSmallScreenWidth)}
        drawerStyle={getNavigationDrawerStyle(
            props.windowWidth,
            props.isSmallScreenWidth,
        )}
        sceneContainerStyle={styles.navigationSceneContainer}
        edgeWidth={500}
        drawerContent={() => <WorkspaceSidebar />}
        screenOptions={{
            cardStyle: styles.navigationScreenCardStyle,
            headerShown: false,
        }}
    >
        <Drawer.Screen
            name="Workspace_New"
            component={WorkspacePage}
        />
    </Drawer.Navigator>
);

WorkspaceDrawerNavigator.propTypes = propTypes;
WorkspaceDrawerNavigator.displayName = 'WorkspaceDrawerNavigator';

export default compose(
    withWindowDimensions,
)(WorkspaceDrawerNavigator);
