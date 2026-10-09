import errorHandler from "../middleware/errors/errorHandler.js"
import * as Service from '../services/authRoutes.js'
import type { Request, Response } from 'express';

export async function loginController(req: Request, res: Response)
{
    try
    {
        const data = await Service.loginService(req.body);

        return res.cookie("refreshToken", data.refreshToken, {
            httpOnly: true,
            secure: process.env.STACK === 'production',
            sameSite: "strict",
            maxAge: 90 * 24 * 60 * 60 * 1000,
        }).cookie("accessToken", data.accessToken, {
            httpOnly: true,
            secure: process.env.STACK === 'production',
            sameSite: "strict",
            maxAge: 15 * 60 * 1000}).json({
            success: true
        })
    }
    catch(err)
    {
         const error = err as { message: string; statusCode?: number };
         return errorHandler(res, error.message, error.statusCode?)
    }
}