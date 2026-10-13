import { AppError } from "../middleware/errors/AppError.js";
import * as Repo from '../repository/userRepo.js'
import { handleServiceError } from "../utils/handleServiceError.js";

export async function addLawsuitService(user_id: number, tytul: string, opis: string)
{
    if(!tytul || !opis)
        {
            throw new AppError("Wprowadź dane", 400);
        }
        
        if (typeof tytul !== 'string' || typeof opis !== 'string') {
                throw new AppError("Tytuł i opis muszą być tekstem", 400);
            }

        tytul = tytul.trim();
        opis = opis.trim();

        if(!tytul || !opis)
        {
            throw new AppError("Wprowadź dane", 400);
        }

        try
        {
            await Repo.addLawsuitTransaction(user_id, tytul, opis);
        }
        catch(err)
        {
            handleServiceError(err)
        }
        

}