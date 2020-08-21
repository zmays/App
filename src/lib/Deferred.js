function Deferred() {
    const doneCallbacks = [];
    const failCallbacks = [];

    return {
        execute(list, args) {
            let i = list.length;

            // Convert arguments to an array so they can be sent to the callbacks via the apply method
            const arrayOfArguments = Array.prototype.slice.call(args);

            while (i--) {
                list[i].apply(null, arrayOfArguments);
            }
        },
        resolve(...params) {
            this.execute(doneCallbacks, params);
        },
        reject(...params) {
            this.execute(failCallbacks, params);
        },
        done(callback) {
            doneCallbacks.push(callback);
            return this;
        },
        fail(callback) {
            failCallbacks.push(callback);
            return this;
        },
    };
}

export default Deferred;
