import React from 'react';
import PropTypes from 'prop-types';
import {View, Image} from 'react-native';
import ZoomContainer from './ZoomContainer';

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,
};

const ImageView = props => {
    return (
        <ZoomContainer url={props.url} />
    );
}

ImageView.propTypes = propTypes;
ImageView.displayName = 'ImageView';

export default ImageView;
