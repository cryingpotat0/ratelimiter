export class RateLimitedQueue {
    constructor(num_requests, time_interval) {
        this._num_requests = num_requests
        this._time_interval = time_interval
        this._active_requests = 0
        this._queue = []
    }

    // addWork queues work on the queue. The work is executed
    // separately to allow addWork to be non-blocking.
    addWork(f) {
        this._queue.push(f)
        setTimeout(() => { this.doWork() }, 0)
    }

    // doWork attempts to do as much work as possible by recursively
    // scheduling itself.
    doWork() {
        if (this._queue.length == 0) {
            if (this._finish_signal_resolver) {
                this._finish_signal_resolver()
            }
            return
        }

        if (this._active_requests < this._num_requests) {
            // Schedule the current function.
            this._active_requests += 1
            const f = this._queue.shift()
            setTimeout(f, 0)

            // Try to do more work.
            if (this._queue.length > 0) {
                setTimeout(() => { this.doWork() }, 0)
            }

            // Allow future work to be unblocked.
            setTimeout(() => {
                this._active_requests -= 1;
                this.doWork();
            }, this._time_interval * 1000)
        }
    }

    // finished returns a Promise that resolves when the queue has
    // finished scheduling all available work. Note that the work might
    // not have completed execution yet.
    async finished() {
        if (this._finish_signal_resolver) {
            return this._finish_signal
        }
        this._finish_signal = new Promise((resolve) => {
            this._finish_signal_resolver = () => {
                resolve()
            }
        })

        return this._finish_signal
    }
}
