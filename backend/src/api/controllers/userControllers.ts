import errorHandler from "../middleware/errors/errorHandler.js"
import * as Service from '../services/userService.js'
import type { Request, Response } from 'express';
import { pipeline } from 'node:stream/promises';
import { AppError } from '../middleware/errors/AppError.js';

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

export async function addUserToLawsuitController(req: Request, res: Response)
{
    const user_id = res.locals.user_id;
    const {member_id, role} = req.body;
    const lawsuit_id = Number(req.params.lawsuitId);

    try
    {
        await Service.addUserToLawsuitService(user_id, lawsuit_id, member_id, role);

        return res.json({success: true})
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode)
    }
}

export async function addEvidenceController(req: Request, res: Response)
{
    const {name, opis} = req.body;
    const user_id = res.locals.user_id;
    const lawsuit_id = Number(req.params.lawsuitId);

    try
    {
        await Service.addEvidenceService(user_id, lawsuit_id, name, opis);

        return res.json({success: true});
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode)
    }
}

export async function takeLawsuitsController(req: Request, res: Response)
{
    try
    {
        const user_id = res.locals.user_id;

        const data = await Service.takeLawsuitsService(user_id)

        return res.json({success: true, data: data});
    }
    catch(err)
    {
       const error = err as {message: string; statusCode: number};
       return errorHandler(res, error.message, error.statusCode) 
    }
    
}

export async function takeLawsuitController(req: Request, res: Response)
{
    try
    {
        const user_id = res.locals.user_id;
        const lawsuit_id = Number(req.params.lawsuitId);

        const data = await Service.takeLawsuitService(user_id, lawsuit_id)

        return res.json({success: true, data})
    }
    catch(err)
    {
      const error = err as {message: string; statusCode: number};
       return errorHandler(res, error.message, error.statusCode)   
    }
}

export async function takeEvidenceController(req: Request, res: Response)
{
    try
    {
        const evidence_id = Number(req.params.evidenceId);
        const user_id = res.locals.user_id;

        const {data, files_data} = await Service.takeEvidenceService(user_id, evidence_id)

        res.json({success: true, data, files_data})
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
       return errorHandler(res, error.message, error.statusCode) 
    }
}

export async function takeFileController(req: Request, res: Response)
{
    try
    {
        const evidence_id = Number(req.params.evidenceId);
        const file_id = Number(req.params.fileId);
        const user_id = res.locals.user_id;

        const {stream, original_name} = await Service.takeFileService(user_id, evidence_id, file_id);

        try
        {
            res.attachment(original_name);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-store');
            await pipeline(stream, res)
        }
        finally
        {
            stream.destroy();
        }
    }
    catch(err)
    {
        if(res.destroyed) return;

        if(res.headersSent)
            {
                res.destroy();
                return
            }

        res.removeHeader('Content-Disposition');
        res.removeHeader('Content-Length');

        if (err instanceof AppError) {
            return errorHandler(res, err.message, err.statusCode);
        }

        console.error(err);
        
        const error = err as {message: string; statusCode: number};
       return errorHandler(res, error.message, error.statusCode) 
    }
}


