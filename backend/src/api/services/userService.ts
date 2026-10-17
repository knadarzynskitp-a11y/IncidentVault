import { JSONCookie } from "cookie-parser";
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

export async function addUserToLawsuitService(user_id: number, lawsuit_id: number, member_id: number, role: string)
{
   
    if(!user_id || !lawsuit_id || !member_id || !role)
    {
        throw new AppError("Wprowadź dane", 400)
    }
    else if(typeof role !== "string")
    {
        throw new AppError("Niepoprawne dane", 400)
    }

    role = role.trim()

    if(!role || user_id <= 0 || lawsuit_id <= 0 || member_id <= 0 || !Number.isSafeInteger(lawsuit_id) || !Number.isSafeInteger(member_id) )
    {
        throw new AppError("Niepoprawne dane", 400)
    }
    else if(user_id === member_id)
    {
        throw new AppError("Nie możesz zmieniać swoich danych", 400)
    }
    else if(role !== "Leader" && role !== "Member")
    {
        throw new AppError("Nieprawidłowa rola użytkownika", 400)
    }

    try
    {
        const data = await Repo.checkUser(lawsuit_id, user_id);

        if(!data)
        {
            throw new AppError("Nieprawidłowe dane. Nie znaleziono sprawy i użytkownika", 404)
        }
        else if(data.role !== "Leader")
        {
            throw new AppError("Nie masz uprawnień do dodawania użytkowników", 403)
        }

        await Repo.addMemberToLawsuit(lawsuit_id, member_id, role);
    }
    catch(err)
    {
        const dbError = err as {
        code?: string;
        constraint?: string;
    };

    if (dbError.code === '23505' && dbError.constraint === 'unique_lawsuit_user')
    {
        throw new AppError("Ten użytkownik już należy do tej sprawy", 409);
    }
    
    else if(dbError.code === '23503' && dbError.constraint === 'fk_is_part_of_lawsuit_user')
    {
        throw new AppError("Nie znaleziono użytkownika", 404)
    }

    handleServiceError(err)
    }
}

export async function addEvidenceService(user_id: number, lawsuit_id: number, name: string, opis: string)
{
    if(!user_id || !lawsuit_id || !name || !opis)
    {
        throw new AppError("Wprowadź dane", 400)
    }
    else if(typeof name !== "string" || typeof opis !== "string")
    {
        throw new AppError("Niepoprawne dane", 400)
    }

    name = name.trim();
    opis = opis.trim();

    if(!name || !opis || user_id <= 0 || lawsuit_id <= 0 || !Number.isSafeInteger(lawsuit_id))
    {
        throw new AppError("Niepoprawne dane", 400)
    }

    try
    {
        const membership = await Repo.checkUser(lawsuit_id, user_id);

        if (!membership) throw new AppError("Nie masz dostępu do tej sprawy", 403);

        await Repo.addEvidence(user_id, lawsuit_id, name, opis);
    }
    catch(err)
    {

        const dbError = err as {
        code?: string;
        constraint?: string;
    };

    if(dbError.code === '23503' && dbError.constraint === 'evidences_lawsuit_id_fkey')
    {
        throw new AppError("Nie znaleziono takiej sprawy", 404)
    }
    else if(dbError.code === '23503' && dbError.constraint === "evidences_user_id_fkey")
    {
        throw new AppError("Nie znaleziono użytkownika", 404)
    }

        handleServiceError(err)
    }

}


export async function checkLawsuitAccessService(user_id: number, lawsuit_id: number) {
    if (!Number.isSafeInteger(user_id) || user_id <= 0) {
        throw new AppError("Zaloguj się ponownie", 401);
    }

    if (!Number.isSafeInteger(lawsuit_id) || lawsuit_id <= 0) {
        throw new AppError("Nieprawidłowe ID sprawy", 400);
    }

    try {
        const membership = await Repo.checkUser(lawsuit_id, user_id);

        if (!membership) {
            throw new AppError("Nie masz dostępu do tej sprawy", 403);
        }

        if (membership.role !== "Leader" && membership.role !== "Member") {
            throw new AppError("Nie możesz dodawać dowodów", 403);
        }
    } catch (err) {
        handleServiceError(err);
    }
}

export async function checkEvidenceUploadAccess(user_id: number, evidence_id: number) {
    if (!Number.isSafeInteger(evidence_id) || evidence_id <= 0) {
        throw new AppError("Nieprawidłowe ID dowodu", 400);
    }
    if (!Number.isSafeInteger(user_id) || user_id <= 0) {
            throw new AppError("Zaloguj się ponownie", 401);
        }

    try {
        const evidence = await Repo.findEvidenceById(evidence_id);

        if (!evidence) {
            throw new AppError("Nie znaleziono dowodu", 404);
        }

        await checkLawsuitAccessService(user_id, evidence.lawsuit_id);

        return evidence;
    } catch (err) {
        handleServiceError(err);
    }
}