import {pool} from '../../config/db.js'

export async function findByEmail(email: string)
{
    const result = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    return result.rows[0];
}

export async function findById(user_id: number)
{
    const result = await pool.query(
        "SELECT * FROM users WHERE id=$1",
        [user_id]
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

export async function deleteResetPasswordDataById(user_id: number)
{
    await pool.query(
        "DELETE * FROM resetpassword WHERE user_id=$1",
        [user_id]
    );
}

export async function createResetPasswordData(user_id: number, hashedResetToken: string, expires_at: Date)
{
    await pool.query(
        "INSERT INTO resetpassword (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user_id, hashedResetToken, expires_at]
    );
}

export async function takeResetPasswordDataByToken(hashedtoken: string)
{
    const result = await pool.query(
        "SELECT * FROM resetpassword WHERE token=$1",
        [hashedtoken]
    );

    return result.rows[0];
}

export async function updateUser(user_id:number, password: string)
{
    await pool.query(
        "UPDATE users SET password = $1 WHERE id = $2",
        [password, user_id]
    )
}