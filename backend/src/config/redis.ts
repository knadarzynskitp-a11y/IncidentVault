import { createClient } from "redis";

const client = createClient({url: `redis://redis:${process.env.REDIS_PORT || 6379}`});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client