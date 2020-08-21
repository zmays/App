import _ from 'underscore';
import Guid from './Guid';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';
import Deferred from './Deferred';

const clientID = Guid();

/**
 * Add our client ID to the list of active IDs
 *
 * @returns {Deferred}
 */
const init = () => Ion.merge(IONKEYS.ACTIVE_CLIENT_IDS, {clientID});

/**
 * Remove this client ID from the array of active client IDs when this client is exited
 *
 * @returns {Deferred}
 */
function removeClient() {
    const promise = new Deferred();

    Ion.get(IONKEYS.ACTIVE_CLIENT_IDS)
        .done((activeClientIDs) => {
            const newActiveClientIDs = _.omit(activeClientIDs, clientID);
            Ion.set(IONKEYS.ACTIVE_CLIENT_IDS, newActiveClientIDs)
                .done(promise.resolve)
                .fail(promise.reject);
        });

    return promise;
}

/**
 * Checks if the current client is the leader (the first one in the list of active clients)
 *
 * @returns {Deferred}
 */
function isClientTheLeader() {
    const promise = new Deferred();

    Ion.get(IONKEYS.ACTIVE_CLIENT_IDS)
        .done(activeClientIDs => promise.resolve(_.first(activeClientIDs) === clientID));

    return promise;
}

export {
    init,
    removeClient,
    isClientTheLeader
};
