import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Navigation from '../libs/Navigation/Navigation';

const WorkspacePage = () => (
    <View>
        <TouchableOpacity
            onPress={() => Navigation.navigate('/settings')}
        >
            <Text>I am a workspace page</Text>
        </TouchableOpacity>
    </View>
);

export default WorkspacePage;
