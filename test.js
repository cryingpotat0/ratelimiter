import { RateLimitedQueue } from "./bucket.js"

(async () => {
    console.log(`Start ${Date.now()}`)
    // 5 requests every 5 seconds. Note that this should limit
    // requests over *every* rolling 5 second window.
    const queue = new RateLimitedQueue(5, 5)
    // Sleep for 4.9 seconds.
    await new Promise(r => setTimeout(r, 4900))
    for (let i = 0; i < 10; i++) {
        // Simulate work that finishes increasingly quickly to show
        // that the queue merely handles rate-limiting the creation
        // of various requests. The finish times are undetermined,
        // and not kept track of in this implementation.
        if (i == 5) {
            // Sleep for 100ms to simulate the worst possible case
            // of requests coming back to back right around the
            // setInterval boundary. This simulates why just using
            // a setInterval is not sufficient for this
            // implementation.
            await new Promise(r => setTimeout(r, 100))
        }
        queue.addWork(async () => {
            console.log(`Execution ${i} started ${Date.now()}`)
            // Sleep by awaiting a promise.
            await new Promise(r => setTimeout(r, (10 - i) * 1000))
            // console.log(`Execution ${i} finished ${Date.now()}`)
        })
    }

    // await queue.finished() // Don't wait for finished to allow execution of functions to complete.
    console.log(`End ${Date.now()}`)
    // process.exit(0)
})()

