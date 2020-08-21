import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import ROUTES from '../../ROUTES';
import Deferred from '../Deferred';

/**
 * Redirects to the sign in page and handles adding any exitTo params to the URL.
 * Normally this method would live in ActionsSession.js, but that would cause a circular dependency with Network.js.
 *
 * @returns {Deferred}
 */
function redirectToSignIn() {
    const promise = new Deferred();

    Ion.get(IONKEYS.CURRENT_URL)
        .done((url) => {
            if (!url) {
                return;
            }

            // If there is already an exitTo, or has the URL of signin, don't redirect
            if (url.indexOf('exitTo') !== -1 || url.indexOf('signin') !== -1) {
                return;
            }

            // When the URL is at the root of the site, go to sign-in, otherwise add the exitTo
            const urlWithExitTo = url === '/'
                ? ROUTES.SIGNIN
                : `${ROUTES.SIGNIN}/exitTo${url}`;
            Ion.set(IONKEYS.APP_REDIRECT_TO, urlWithExitTo).done(promise.resolve);
        });

    return promise;
}

export default redirectToSignIn;
