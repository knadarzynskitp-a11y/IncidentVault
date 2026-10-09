import { AppError } from "../middleware/errors/AppError.js";
import * as Repo from '../repository/authRepo.js'
import validator from 'validator'
import { handleServiceError } from "../utils/handleServiceError.js";
import bcrypt from 'bcrypt'
import { generateTokens } from "../utils/generateTokens.js";

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