const redis = require("../config/redis");

const Cache = {
    async put(key, value, ttl = 60) {
        return await redis.set(key, JSON.stringify(value), "EX", ttl);
    },

    async get(key) {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    },

    async forget(key) {
        return await redis.del(key);
    },

    async has(key) {
        return (await redis.exists(key)) === 1;
    }
};

module.exports = Cache;
