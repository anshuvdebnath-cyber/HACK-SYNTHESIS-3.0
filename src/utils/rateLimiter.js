// Class-based rate limiter enforcing a minimum time gap between successive calls
class RateLimiter {
    constructor(minGapMs = 0) {
        this.minGapMs = minGapMs;
        this.lastCallTime = 0;
        this.queue = Promise.resolve();
    }
    async schedule(fn) {
        this.queue = this.queue.then(async () => {
            const now = Date.now();
            const elapsed = now - this.lastCallTime;
            if (elapsed < this.minGapMs) {
                const wait = this.minGapMs - elapsed;
                console.log(`⏱️  Pacing: waited ${wait}ms`);
                await new Promise(r => setTimeout(r, wait));
            }
            this.lastCallTime = Date.now();
            return fn();
        });
        return this.queue;
    }
}

module.exports = RateLimiter;
