import React from 'react';
import Onyx from 'react-native-onyx';
import TranslationContext from './TranslationContext';

export default class TranslationProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            locale: 'en',
        };
    }

    componentDidMount() {
        Onyx.connect({
            key: 'locale',
            callback: (val) => {
                this.setState({locale: val || 'en'});
            }
        });
    }

    render() {
        return (
            <TranslationContext.Provider
                value={{locale: this.state.locale}}
            >
                {this.props.children}
            </TranslationContext.Provider>
        );
    }
}

window.changeLocaleTo = (val) => Onyx.set('locale', val);
