/**
 * Native devices don't support Promise.allSettled, but all modern browsers do so a reference directly to the native
 * Promise implementation is fine.
 */

import _ from 'underscore';
import Deferred from '../Deferred';

/**
 * Returns a promise that is resolved when all provided promises are either resolved or rejected
 *
 * @param {Promise[]} arrayOfPromises
 * @returns {Deferred}
 */
const promiseAllSettled = (arrayOfPromises) => {
    const promise = new Deferred();
    const returnedData = [];

    const doneWithPromise = _.after(arrayOfPromises.length, () => {
        promise.resolve(returnedData);
    });

    _.each(arrayOfPromises, p => p
        .done((data) => {
            returnedData.push(data);
            doneWithPromise();
        })
        .fail(doneWithPromise));

    return promise;
};

export default promiseAllSettled;
