export class RateLimitedQueue {
    constructor(num_requests, time_interval) {
        this._num_requests = num_requests
        this._time_interval = time_interval
        this._rps = num_requests / time_interval
        this._active_requests = 0
        this._queue = []

        setInterval(() => {
            this._active_requests = 0
            this.doWork()
        }, time_interval * 1000)
    }

    // addWork queues work on the queue. The work is executed
    // separately to allow addWork to be non-blocking.
    addWork(f) {
        this._queue.push(f)
        setTimeout(() => { this.doWork() }, 0)
    }

    // doWork 
    doWork() {
        if (this._queue.length == 0) {
            if (this._finish_signal_resolver) {
                this._finish_signal_resolver()
            }
            return
        }

        if (this._active_requests < this._num_requests) {
            this._active_requests += 1
            const f = this._queue.shift()
            setTimeout(f, 0)
        } else {
            const outstandingRequests = this._queue.length
            const minSecondsToWait = outstandingRequests / this._rps
            console.log(`Scheduling work for ${minSecondsToWait}s ahead`)
            setTimeout(() => { this.doWork() }, minSecondsToWait * 1000)
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
