import React from 'react';
import TranslationContext from './TranslationContext';

// import the non react translation library here...
function translate(locale, props) {
    return `The locale is: ${locale}`;
}

const Translate = props => {
    return (
        <TranslationContext.Consumer>
            {({locale}) => {
                return translate(locale, props);
            }}
        </TranslationContext.Consumer>
    )
}

export default Translate;
