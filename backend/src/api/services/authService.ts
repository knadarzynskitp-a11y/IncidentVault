import { AppError } from "../middleware/errors/AppError.js";
import * as Repo from '../repository/authRepo.js'
import validator from 'validator'
import { handleServiceError } from "../utils/handleServiceError.js";
import bcrypt from 'bcrypt'
import { generateTokens } from "../utils/generateTokens.js";
import sendEmailVerification from "../utils/mail/sendMail.js";

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
                throw new AppError("Nieprawidłowy login lub hasło", 400)
            }

            const checkPassword = await bcrypt.compare(password, user.password);

            if(!checkPassword)
            {
                throw new AppError("Nieprawidlówy login lub hasło", 400);
            }

            const user_id = user.id;

            const tokens = generateTokens(user_id);

            await Repo.createRefreshtoken(tokens.hashedRefreshToken, tokens.expires_at);

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
    if(password.length > 72)
    {
        throw new AppError("Hasło jest zbyt długie", 400)
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

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await Repo.deleteOldDataEmailVerification(email);

        await Repo.createEmailVerificationData(name, lastname, email, hashedPassword, code)

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