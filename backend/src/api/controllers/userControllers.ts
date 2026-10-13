import errorHandler from "../middleware/errors/errorHandler.js"
import * as Service from '../services/userService.js'
import type { Request, Response } from 'express';

export async function addLawsuitController(req: Request, res: Response)
{
    const {tytul, opis} = req.body;
    const user_id = res.locals.user_id;

    try
    {
        await Service.addLawsuitService(user_id, tytul, opis)

        return res.json({success: true})
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode)
    }
}

