function Deferred() {
    const doneCallbacks = [];
    const failCallbacks = [];

    function execute(list, args) {
        let i = list.length;

        // Convert arguments to an array so they can be sent to the callbacks via the apply method
        const arrayOfArguments = Array.prototype.slice.call(args);

        while (i--) {
            list[i].apply(null, arrayOfArguments);
        }
    };

    return {
        resolve(...params) {
            execute(doneCallbacks, params);
        },
        reject(...params) {
            execute(failCallbacks, params);
        },
        done(callback) {
            doneCallbacks.push(callback);
            return this;
        },
        fail(callback) {
            failCallbacks.push(callback);
            return this;
        }
    };
}

export default Deferred;
