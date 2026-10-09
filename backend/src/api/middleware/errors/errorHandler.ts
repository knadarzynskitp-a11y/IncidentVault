import type {Response} from 'express'

export default async function errorHandler(res: Response, msg: string, code: number )
{
    return res.status(code || 500).json({
        success: false,
        errormessage: msg
    });
}