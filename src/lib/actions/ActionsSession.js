import _ from 'underscore';
import Ion from '../Ion';
import {request} from '../Network';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import redirectToSignIn from './ActionsSignInRedirect';
import Deferred from '../Deferred';

/**
 * Sign in with the API
 *
 * @param {string} login
 * @param {string} password
 * @param {string} twoFactorAuthCode
 * @param {string} exitTo
 * @returns {Promise}
 */
function signIn(login, password, twoFactorAuthCode = '', exitTo) {
    console.debug('[SIGNIN] Authenticating with expensify login');

    return request('Authenticate', {
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check for credentials for
        // the expensify partnerID to let users authenticate with their expensify user and password.
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
        twoFactorAuthCode,
        exitTo
    })
        .fail((err) => {
            console.error(err);
            console.debug('[SIGNIN] Request error');
            return Ion.merge(IONKEYS.SESSION, {error: err.message});
        });
}

/**
 * Delete login
 * @param {string} authToken
 * @param {string} login
 * @returns {Deferred}
 */
function deleteLogin(authToken, login) {
    return request('DeleteLogin', {
        authToken,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
    })
        .fail(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
}

/**
 * Sign out of our application
 *
 * @returns {Deferred}
 */
function signOut() {
    return redirectToSignIn()
        .done(() => {
            Ion.multiGet([IONKEYS.SESSION, IONKEYS.CREDENTIALS])
                .done((data) => {
                    deleteLogin(data.session.authToken, data.credentials.login)
                        .done(Ion.clear)
                        .fail(err => Ion.merge(IONKEYS.SESSION, {error: err.message}));
                });
        });
}

/**
 * Make sure the authToken we have is OK to use
 *
 * @returns {Deferred}
 */
function verifyAuthToken() {
    const promise = new Deferred();

    Ion.multiGet([IONKEYS.LAST_AUTHENTICATED, IONKEYS.CREDENTIALS])
        .done(({last_authenticated, credentials}) => {
            const haveCredentials = !_.isNull(credentials);
            const haveExpiredAuthToken = last_authenticated < new Date().getTime() - CONFIG.AUTH_TOKEN_EXPIRATION_TIME;

            if (haveExpiredAuthToken && haveCredentials) {
                console.debug('Invalid auth token: Token has expired.');
                return signIn(credentials.login, credentials.password)
                    .done(promise.resolve)
                    .fail(promise.reject);
            }

            // We make this request to see if we have a valid authToken, and we only want to retry it if we know we
            // have credentials to re-authenticate
            return request('Get', {returnValueList: 'account', doNotRetry: !haveCredentials})
                .done((data) => {
                    if (data && data.jsonCode === 200) {
                        return Ion.merge(IONKEYS.SESSION, data)
                            .done(promise.resolve)
                            .fail(promise.reject);
                    }

                    // If the auth token is bad and we didn't have credentials saved, we want them to go to the sign in page
                    redirectToSignIn()
                        .done(promise.resolve)
                        .fail(promise.reject);
                });
        });

    return promise;
}

export {
    signIn,
    signOut,
    verifyAuthToken,
};
