import {pool} from '../../config/db.js'

export async function findByEmail(email: string)
{
    const result = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    return result.rows[0];
}

export async function createRefreshtoken(hashedRefreshToken: string, expires_at: Date)
{
    await pool.query(
        "INSERT INTO refreshTokens (hashedRefreshToken, expires_at) VALUES ($1, $2)",
        [hashedRefreshToken, expires_at]
    );
}