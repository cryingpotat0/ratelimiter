import { RateLimitedQueue } from "./bucket.js"

(async () => {
    console.log(`Start ${Date.now()}`)
    const queue = new RateLimitedQueue(5, 2)
    for (let i = 0; i < 10; i++) {
        // Simulate work that finishes increasingly quickly to show
        // that the queue merely handles rate-limiting the creation
        // of various requests. The finish times are undetermined,
        // and not kept track of in this implementation.
        queue.addWork(async () => {
            console.log(`Execution ${i} started ${Date.now()}`)
            // Sleep by awaiting a promise.
            await new Promise(r => setTimeout(r, (10 - i) * 1000))
            console.log(`Execution ${i} finished ${Date.now()}`)
        })
    }

    // await queue.finished() // Don't wait for finished to allow execution of functions to complete.
    console.log(`End ${Date.now()}`)
    // process.exit(0)
})()

