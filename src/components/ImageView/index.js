import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string,
};

const defaultProps = {
    url: '',
    height: 300,
    width: 300,
};

const ImageView = props => (
    <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundSize: '100% 100%'}}>
        <ImageWithSizeCalculation
            onMeasure={props.onMeasure}
            url={props.url}
        />
    </View>
);

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
