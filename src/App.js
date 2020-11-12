import React from 'react';
import Expensify from './Expensify';
import TranslationProvider from './components/Translation/TranslationProvider';

export default () => (
    <TranslationProvider>
        <Expensify />
    </TranslationProvider>
);
