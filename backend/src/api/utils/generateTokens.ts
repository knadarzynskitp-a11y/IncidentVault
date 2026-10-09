import crypto from 'crypto'
import { AppError } from '../middleware/errors/AppError.js';
import jwt from 'jsonwebtoken'
export function generateTokens(user_id: number)
{
    if(!user_id)
    {
        throw new AppError("Brak danych do tokenow", 400)
    }
    //generujemy tokeny
        const accessToken = jwt.sign(
            {user_id: user_id}, 
            process.env.JWT_SECRET!,
            {expiresIn: '15m'}
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
        const expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

        return{
            accessToken,
            refreshToken,
            hashedRefreshToken,
            expires_at
        }
}