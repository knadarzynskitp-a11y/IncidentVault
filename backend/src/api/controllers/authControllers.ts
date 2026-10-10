import errorHandler from "../middleware/errors/errorHandler.js"
import * as Service from '../services/authService.js'
import type { Request, Response } from 'express';

export async function loginController(req: Request, res: Response)
{
    const {email, password} = req.body;
    try
    {
        const data = await Service.loginService(email, password);

        const refreshToken = data.refreshToken;
        const accessToken = data.accessToken

        return res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.STACK === 'production',
            sameSite: "strict",
            maxAge: 90 * 24 * 60 * 60 * 1000,
        }).cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.STACK === 'production',
            sameSite: "strict",
            maxAge: 15 * 60 * 1000}).json({
            success: true
        })
    }
    catch(err)
    {
         const error = err as { message: string; statusCode: number };
         return errorHandler(res, error.message, error.statusCode);
    }
}


export async function registerController(req: Request, res: Response)
{
    const {name, lastname, email, password} = req.body;

    try
    {
        await Service.registerService(name, lastname, email, password);

        return res.json({
            success:true
        })
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode);
    }
    
}


export async function registerEndController(req: Request, res: Response)
{
    const {email, code} = req.body;

    try
    {
        await Service.registerEndService(email, code);

        return res.json({success:true})
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode);
    }
}