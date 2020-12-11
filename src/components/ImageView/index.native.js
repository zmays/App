import React from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import ImgZoom from 'react-native-image-pan-zoom';
import ImageWithSizeCalculation from '../ImageWithSizeCalculation';
import {variables} from '../../styles/StyleSheet';
import ZoomContainer from './ZoomContainer';

/**
 * On the native layer, we use a image library to handle zoom functionality
 */

const propTypes = {
    // URL to full-sized image
    url: PropTypes.string.isRequired,

    // Image height
    height: PropTypes.number,

    // Image width
    width: PropTypes.number,

    // Callback to fire when image is measured
    onMeasure: PropTypes.func,
};

const defaultProps = {
    height: 300,
    width: 300,
    onMeasure: () => {},
};

class ImageView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageHeight: 100,
            imageWidth: 100,
        };
    }

    render() {
        // Default windowHeight accounts for the modal header height
        const windowHeight = Dimensions.get('window').height - variables.modalHeaderBarHeight;
        const windowWidth = Dimensions.get('window').width;

        return (
            <ZoomContainer url={this.props.url} />
            // <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
            //     <ImgZoom
            //         cropWidth={windowWidth}
            //         cropHeight={windowHeight}
            //         imageWidth={this.state.imageWidth}
            //         imageHeight={this.state.imageHeight}
            //     >
            //         <ImageWithSizeCalculation
            //             url={this.props.url}
            //             onMeasure={({width, height}) => this.setState({imageHeight: height, imageWidth: width})}
            //         />
            //     </ImgZoom>
            // </View>
        );
    }
}

ImageView.propTypes = propTypes;
ImageView.defaultProps = defaultProps;
ImageView.displayName = 'ImageView';

export default ImageView;
