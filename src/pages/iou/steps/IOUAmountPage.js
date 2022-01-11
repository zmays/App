import React from 'react';
import {
    View,
    TouchableOpacity,
    InteractionManager,
    AppState,
    Keyboard,
} from 'react-native';
import PropTypes from 'prop-types';
import { withOnyx } from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import withWindowDimensions, { windowDimensionsPropTypes } from '../../../components/withWindowDimensions';
import TextInputAutoWidth from '../../../components/TextInputAutoWidth';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import withLocalize, { withLocalizePropTypes } from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import CONST from '../../../CONST';

const propTypes = {
    /** Whether or not this IOU has multiple participants */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** The ID of the report this screen should display */
    reportID: PropTypes.string.isRequired,

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** The currency list constant object from Onyx */
    currencyList: PropTypes.objectOf(PropTypes.shape({
        /** Symbol for the currency */
        symbol: PropTypes.string,

        /** Name of the currency */
        name: PropTypes.string,

        /** ISO4217 Code for the currency */
        ISO4217: PropTypes.string,
    })).isRequired,

    /** Previously selected amount to show if the user comes back to this screen */
    selectedAmount: PropTypes.string.isRequired,

    /** Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (retrieving users preferred currency) */
        loading: PropTypes.bool,

        /** Selected Currency Code of the current IOU */
        selectedCurrencyCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
};

class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountNumberPad = this.updateAmountNumberPad.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.inputSelectionChange = this.inputSelectionChange.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.focusTextInput = this.focusTextInput.bind(this);
        this.dismissKeyboardWhenBackgrounded = this.dismissKeyboardWhenBackgrounded.bind(this);

        this.state = {
            amount: props.selectedAmount,
            currentSelection: { start: null, end: null },
        };
    }

    componentDidMount() {
        this.focusTextInput();
        this.appStateSubscription = AppState.addEventListener(
            'change',
            this.dismissKeyboardWhenBackgrounded,
        );
    }

    componentDidUpdate(prevProps) {
        if (!_.isNull(this.state.currentSelection.start)) {
            this.textInput.setNativeProps({
                selection: this.state.currentSelection,
            });
        }
        if (this.props.iou.selectedCurrencyCode === prevProps.iou.selectedCurrencyCode) {
            return;
        }

        this.focusTextInput();
    }

    componentWillUnmount() {
        if (!this.appStateSubscription) {
            return;
        }
        this.appStateSubscription.remove();
    }

    dismissKeyboardWhenBackgrounded(nextAppState) {
        if (!nextAppState.match(/inactive|background/)) {
            return;
        }
        Keyboard.dismiss();
    }

    /**
     * Focus text input
     */
    focusTextInput() {
        // Component may not initialized due to navigation transitions
        // Wait until interactions are complete before trying to focus
        InteractionManager.runAfterInteractions(() => {
            // Focus text input
            if (!this.textInput) {
                return;
            }

            this.textInput.focus();
        });
    }

    /**
     * Check if amount is a decimal upto 3 digits
     *
     * @param {String} amount
     * @returns {Boolean}
     */
    validateAmount(amount) {
        const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
        return amount === '' || (decimalNumberRegex.test(amount) && (parseFloat((amount * 100).toFixed(2)).toString().length <= CONST.IOU.AMOUNT_MAX_LENGTH));
    }

    /**
     * Strip comma from the amount
     *
     * @param {String} amount
     * @returns {String}
     */
    stripCommaFromAmount(amount) {
        return amount.replace(/,/g, '');
    }

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    updateAmountNumberPad(key) {
        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (this.state.amount.length > 0) {
                const beginIndex = _.isNull(this.state.currentSelection.start) ? this.state.amount.length : this.state.currentSelection.start;
                const endIndex = _.isNull(this.state.currentSelection.end) ? this.state.amount.length : this.state.currentSelection.end;
                const [newAmount, newPosition] = this.cursorPositionToNewStringAndPositionOnBackspace(this.state.amount, beginIndex, endIndex);
                this.setState({ amount: newAmount, currentSelection: { start: newPosition, end: newPosition } });
            }
            return;
        }


        this.setState((prevState) => {
            const amount = `${prevState.amount}${key}`;
            const valid = this.validateAmount(amount);
            if (valid) {
                const stripped = this.stripCommaFromAmount(amount);
                return {
                    amount: stripped,
                    currentSelection: { start: stripped.length, end: stripped.length },
                };
            }
            return prevState;
        });
    }

    /**
     * take string representing current displayed input and the cursor
     * position to calculate the displayed input and new cursor position
     * whenever user clicks backspace
     *
     * @param {String} input
     * @param {Number} start
     * @param {Number} end
     */
    cursorPositionToNewStringAndPositionOnBackspace(input, start, end) {
        // cursor is at front of input, input stays the same
        if (start === 0 && end === 0) {
            return [input, 0];
        }

        const inputAsArray = input.split('');

        // cursor is in one location, somewhere in the input
        if (start === end) {
            const newInput = inputAsArray.filter((e, i) => i !== start - 1).join('');
            const newPosition = start - 1;
            return [newInput, newPosition];
        }

        console.log(input, start, end);

        // cursor is selecting multiple elements of input
        const newInput = inputAsArray.filter((e, i) => i <= start - 1 || i > end - 1).join('');
        const newPosition = (end - start) - 1;
        return [newInput, newPosition];
    }

    /**
     * Update amount on amount change
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit
     *
     * @param {String} amount
     */
    updateAmount(amount) {
        if (!this.validateAmount(amount)) {
            return;
        }

        this.setState({ amount: this.stripCommaFromAmount(amount) });
    }

    /**
     * Store cursor and select in local state
     *
     * @param {Event} event
     */
    inputSelectionChange(event) {
        this.setState({ currentSelection: event.nativeEvent.selection });
    }


    render() {
        return (
            <>
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.w100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
                >
                    <TouchableOpacity onPress={() => Navigation.navigate(this.props.hasMultipleParticipants
                        ? ROUTES.getIouBillCurrencyRoute(this.props.reportID)
                        : ROUTES.getIouRequestCurrencyRoute(this.props.reportID))}
                    >
                        <Text style={styles.iouAmountText}>
                            {lodashGet(this.props.currencyList, [this.props.iou.selectedCurrencyCode, 'symbol'])}
                        </Text>
                    </TouchableOpacity>
                    <TextInputAutoWidth
                        inputStyle={styles.iouAmountTextInput}
                        textStyle={styles.iouAmountText}
                        onChangeText={this.updateAmount}
                        selection={this.state.currentSelection}
                        onSelectionChange={this.inputSelectionChange}
                        ref={el => this.textInput = el}
                        value={this.state.amount}
                        placeholder="0"
                        keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        showSoftInputOnFocus={false}
                        inputmode="none"
                    />
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {this.props.isSmallScreenWidth
                        ? (
                            <BigNumberPad
                                numberPressed={this.updateAmountNumberPad}
                            />
                        ) : <View />}

                    <Button
                        success
                        style={[styles.w100, styles.mt5]}
                        onPress={() => this.props.onStepComplete(this.state.amount)}
                        pressOnEnter
                        isDisabled={!this.state.amount.length || parseFloat(this.state.amount) < 0.01}
                        text={this.props.translate('common.next')}
                    />
                </View>
            </>
        );
    }
}

IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        currencyList: { key: ONYXKEYS.CURRENCY_LIST },
        iou: { key: ONYXKEYS.IOU },
    }),
)(IOUAmountPage);
