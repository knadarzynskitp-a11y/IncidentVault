import { AppError } from "../middleware/errors/AppError.js";
import * as Repo from '../repository/authRepo.js'
import validator from 'validator'
import { handleServiceError } from "../utils/handleServiceError.js";
import bcrypt from 'bcrypt'
import { generateTokens } from "../utils/generateTokens.js";
import sendEmailVerification from "../utils/mail/sendMail.js";
import crypto from 'crypto'
import sendResetMail from "../utils/mail/sendResetPasswordMail.js";
import jwt from 'jsonwebtoken'

export async function loginService(email: string, password: string)
{
        if(!email || !password)
        {
            throw new AppError("Wprowadź dane", 400);
        }

        email = email.trim();
        password = password.trim();

        if(!email || !password)
        {
            throw new AppError("Wprowadź dane", 400);
        }
        
        if(!validator.isEmail(email))
        {
            throw new AppError("Wprowadzony adres e-mail najprawdopodobniej nie jest adresem e-mail", 400)
        }

        try
        {
            const user = await Repo.findByEmail(email);

            if(!user)
            {
                throw new AppError("Nieprawidłowy e-mail lub hasło", 400)
            }

            const checkPassword = await bcrypt.compare(password, user.password);

            if(!checkPassword)
            {
                throw new AppError("Nieprawidłowy e-mail lub hasło", 400);
            }

            const user_id = user.id;

            const tokens = generateTokens(user_id);

            await Repo.createRefreshtoken(tokens.hashedRefreshToken, tokens.expires_at, user_id);

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }

        }
        catch(err)
        {
            handleServiceError(err)
        }
        
}


export async function registerService(name: string, lastname: string, email: string, password: string)
{
    if(!name || !lastname || !email || !password)
    {
        throw new AppError("Wprowadź dane", 400);
    }

    name = name.trim()
    lastname = lastname.trim()
    email = email.trim()
    password = password.trim()
    
    if(!name || !lastname || !email || !password)
    {
        throw new AppError("Wprowadź dane", 400);
    }
    if(name.length > 15) 
    {
        throw new AppError("Imię jest zbyt długie", 400);
    }
    if(lastname.length < 2 || lastname.length > 30)
    {
        throw new AppError("Nazwisko musi zawierać od 2 do maksymalnie 30 znaków", 400)
    }
    if(!validator.isEmail(email))
    {
        throw new AppError("Podany adres e-mail najprawdopodobniej nie jest adresem e-mail", 400)
    }
    if(!validator.isStrongPassword(password, {
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
        minLength: 8
    }))
    {
        throw new AppError("Hasło musi zawierać co najmniej jedną małą, dużą literę, jedną cyfrę oraz minimum 8 znaków", 400)
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw new AppError("Hasło jest zbyt długie", 400);
    }
    const zawieraCyfry = /\d/.test(name);
    const zawieraZnakiSpecjalne = /[^A-Za-z0-9]/.test(name);
    const zawieraCyfry2 = /\d/.test(lastname);
    const zawieraZnakiSpecjalne2 = /[^A-Za-z0-9]/.test(lastname);

    if(zawieraCyfry || zawieraCyfry2 || zawieraZnakiSpecjalne || zawieraZnakiSpecjalne2)
    {
        throw new AppError("Imię i nazwisko nie mogą zawierać znaków specjalnych i cyfr", 400)
    }
    try
    {
        const match = await Repo.findByEmail(email);

        if(match)
        {
            throw new AppError("Podany adres email jest już zajęty", 400)
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const code = crypto.randomInt(100000, 1000000).toString();
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);

        await Repo.deleteOldDataEmailVerification(email);

        await Repo.createEmailVerificationData(name, lastname, email, hashedPassword, code, expires_at)

        await sendEmailVerification(email, code);
    }
    catch(err)
    {
        handleServiceError(err)
    }

    
}


export async function registerEndService(email: string, code: string)
{
    if(!email || !code)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    email = email.trim()
    code = code.trim()

    if(!email || !code)
    {
        throw new AppError("Wprowadź dane", 400)
    }
    try
    {
        const data = await Repo.takeEmailVerificationDataByEmail(email);

        if(!data)
        {
            throw new AppError("Nieprawidłowy kod", 400);
        }

        if(code !== data.code)
        {
            throw new AppError("Nieprawidłowy kod", 400)
        }
        else if(data.expires_at < new Date())
        {
            throw new AppError("Kod wygasł", 400)
        }

        const result = await Repo.findByEmail(email);

        if(result)
        {
            throw new AppError("email jest zajęty", 400);
        }

        await Repo.deleteOldDataEmailVerification(data.email)

        await Repo.createUser(data.name, data.lastname, data.email, data.password)
    }
    catch(err)
    {
        handleServiceError(err)
    }
}


export async function forgotPasswordService(email:string)
{
    if(!email)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    email = email.trim();

    if(!email)
    {
        throw new AppError("Wprowadź dane", 400)
    }
    else if(!validator.isEmail(email))
    {
        throw new AppError("Podany adres e-mail najprawdopodobniej nie jest adresem e-mail", 400)
    }

    try
    {
        const match = await Repo.findByEmail(email);

        if(!match)
        {
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetLink = process.env.URL+`/reset-password/`+resetToken;
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);

        await Repo.deleteResetPasswordDataById(match.id);
        
        //hash tokenu
        const hashResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        await Repo.createResetPasswordData(match.id, hashResetToken, expires_at);

        await sendResetMail(email, resetLink);
    }
    catch(err)
    {
        handleServiceError(err)
    }
}

export async function resetPasswordService(password:string, token:string)
{
    if(!password || !token)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    password = password.trim()
    token = token.trim()

    if(!password || !token)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    if(!validator.isStrongPassword(password, {
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
        minLength: 8
    }))
    {
        throw new AppError("Hasło musi zawierać co najmniej jedną małą, dużą literę, jedną cyfrę oraz minimum 8 znaków", 400)
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw new AppError("Hasło jest zbyt długie", 400);
    }

    const hashResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'); 

        try
        {
            const data = await Repo.takeResetPasswordDataByToken(hashResetToken);

            if(!data)
            {
                throw new AppError("Nieprawidłowy token", 400)
            }
            else if(data.expires_at < new Date())
            {
                await Repo.deleteResetPasswordDataById(data.user_id)
                throw new AppError("Link wygasł", 400);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await Repo.resetTransaction(data.user_id, hashedPassword)

        }
        catch(err)
        {
            handleServiceError(err)
        }
}

export async function refreshService(refreshToken: string)
{
    if(!refreshToken)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    refreshToken = refreshToken.trim()

    if(!refreshToken)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    const hashedRefreshToken = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');


    try
    {
        const data = await Repo.takeRefreshTokenByToken(hashedRefreshToken);

        if(!data)
        {
            throw new AppError("Nieprawidłowy token", 400)
        }

        if(data.expires_at < new Date())
        {
            await Repo.deleteRefreshtokenByToken(hashedRefreshToken)
            throw new AppError("Token wygasł, zaloguj się ponownie", 401)
        }

        await Repo.deleteRefreshtokenByToken(hashedRefreshToken);

        const tokens = generateTokens(data.user_id);

        await Repo.createRefreshtoken(tokens.hashedRefreshToken, tokens.expires_at, data.user_id)

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }
    catch(err)
    {
        handleServiceError(err)
    }
}

export async function logoutService(refreshToken: string, allDevices: boolean)
{
    if(!refreshToken)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    refreshToken = refreshToken.trim()

    if(!refreshToken)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    const hashedRefreshToken = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

    try
    {
        if(allDevices)
        {
           const data = await Repo.takeRefreshTokenByToken(hashedRefreshToken);

           if(!data)
           {
            throw new AppError("Brak uprawnień do wylogowania użytkownika", 403)
           }

           await Repo.deleteRefreshtokenById(data.user_id)
        }
        else{
            await Repo.deleteRefreshtokenByToken(hashedRefreshToken);
        }
    }
    catch(err)
    {
        handleServiceError(err)
    }
}

export async function requireBeLoggedService(accessToken: string)
{
    if(!accessToken)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    accessToken = accessToken.trim()

    if(!accessToken)
    {
        throw new AppError("Wprowadź dane", 400)
    }

    try
    {
        return jwt.verify(accessToken, process.env.JWT_SECRET!)
    }
    catch(err)
    {
        if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError || err instanceof jwt.NotBeforeError) 
        {
            throw new AppError("Zaloguj się ponownie", 401);
        }
    throw err;
    }

    
}