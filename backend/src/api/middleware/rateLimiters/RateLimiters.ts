import { rateLimit } from 'express-rate-limit'
import { RedisStore} from 'rate-limit-redis'
import client from '../../../config/redis.js'

export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
	limit: 10, 
	standardHeaders: true, 
	legacyHeaders: false, 
	store: new RedisStore({
		 prefix: 'rl:auth:',
		sendCommand: (...args: string[]) => client.sendCommand(args),
	}),
});

export const userLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
	limit: 50, 
	standardHeaders: true, 
	legacyHeaders: false, 
	store: new RedisStore({
		 prefix: 'rl:user:',
		sendCommand: (...args: string[]) => client.sendCommand(args),
	}),
});