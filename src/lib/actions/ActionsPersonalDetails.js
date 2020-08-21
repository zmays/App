import _ from 'underscore';
import Ion from '../Ion';
import {queueRequest} from '../Network';
import IONKEYS from '../../IONKEYS';
import md5 from '../md5';
import CONST from '../../CONST';

/**
 * Returns the URL for a user's avatar and handles someone not having any avatar at all
 *
 * @param {object} personalDetails
 * @param {string} login
 * @returns {string}
 */
function getAvatar(personalDetails, login) {
    if (personalDetails && personalDetails.avatar) {
        return personalDetails.avatar.replace(/&d=404$/, '');
    }

    // There are 8 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login (which is converted from HEX to INT)
    const loginHashBucket = (parseInt(md5(login).substring(0, 4), 16) % 8) + 1;
    return `${CONST.CLOUDFRONT_URL}/images/avatars/avatar_${loginHashBucket}.png`;
}

/**
 * Get the personal details for our organization
 *
 * @returns {Deffered}
 */
function fetch() {
    const promise = Ion.get(IONKEYS.SESSION, 'email')
        .done((email) => {
            if (!email) {
                throw Error('No login');
            }

            const currentLogin = email;
            queueRequest('Get', {returnValueList: 'personalDetailsList'})
                .done((data) => {
                    const allPersonalDetails = _.reduce(data.personalDetailsList, (obj, personalDetails, login) => {
                        // Form the details into something that has all the data in an easy to use format.
                        const avatarURL = getAvatar(personalDetails, login);
                        const firstName = personalDetails.firstName || '';
                        const lastName = personalDetails.lastName || '';
                        const fullName = `${firstName} ${lastName}`.trim();
                        const displayName = fullName === '' ? login : fullName;
                        const displayNameWithEmail = fullName === '' ? login : `${fullName} (${login})`;
                        return {
                            ...obj,
                            [login]: {
                                login,
                                avatarURL,
                                firstName,
                                lastName,
                                fullName,
                                displayName,
                                displayNameWithEmail,
                            }
                        };
                    }, {});

                    Ion.set(IONKEYS.PERSONAL_DETAILS, allPersonalDetails);

                    // Get my personal details so they can be easily accessed and subscribed to on their own key
                    Ion.merge(IONKEYS.MY_PERSONAL_DETAILS, allPersonalDetails[currentLogin] || {});
                });
        });

    // Refresh the personal details every 30 minutes
    setTimeout(fetch, 1000 * 60 * 30);
    return promise;
}

/**
 * Get the timezone of the logged in user
 *
 * @returns {Promise}
 */
function fetchTimezone() {
    const requestPromise = queueRequest('Get', {
        returnValueList: 'nameValuePairs',
        name: 'timeZone',
    })
        .done((data) => {
            const timezone = data.nameValuePairs.timeZone.selected || 'America/Los_Angeles';
            Ion.merge(IONKEYS.MY_PERSONAL_DETAILS, {timezone});
        });

    // Refresh the timezone every 30 minutes
    setTimeout(fetchTimezone, 1000 * 60 * 30);
    return requestPromise;
}

export {
    fetch,
    fetchTimezone,
};
