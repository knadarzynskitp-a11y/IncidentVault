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
        "INSERT INTO refreshtokens (hashedRefreshToken, expires_at) VALUES ($1, $2)",
        [hashedRefreshToken, expires_at]
    );
}

export async function deleteOldDataEmailVerification(email:string)
{
    await pool.query(
        "DELETE * FROM emailverification WHERE email=$1",
        [email]
    );
}

export async function createEmailVerificationData(name: string, lastname: string, email: string, hashedPassword: string, code: string)
{
    await pool.query(
        "INSERT INTO emailverification (name, lastname, email, password, code) VALUES ($1, $2, $3, $4, $5)",
        [name, lastname, email, hashedPassword, code]
    );
}

export async function takeEmailVerificationDataByEmail(email: string)
{
    const data = await pool.query(
        "SELECT * FROM emailverification WHERE email=$1",
        [email]
    );
    return data.rows[0];
}

export async function createUser(name: string, lastname: string, email: string, hashedPassword: string)
{
    await pool.query(
        "INSERT INTO users (name, lastname, email, password) VALUES ($1, $2, $3, $4)",
        [name, lastname, email, hashedPassword]
    );
}