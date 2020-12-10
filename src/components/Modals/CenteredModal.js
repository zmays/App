import React from 'react';
import ModalBase from './ModalBase';

/**
 * A centered modal is one that has a visible backdrop
 * and can be dismissed by clicking outside of the modal.
 * This modal should take up the entire visible area when
 * viewed in mobile or mobile web.
 */
const CenteredModal = props => (
    <ModalBase
        {...props}
        type="centered"
    />
);

CenteredModal.displayName = 'CenteredModal';
export default CenteredModal;
