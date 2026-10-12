import errorHandler from "../middleware/errors/errorHandler.js"
import * as Service from '../services/authService.js'
import type { NextFunction, Request, response, Response } from 'express';
import { clearCookie } from "../utils/clearCookie.js";

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

export async function forgotPasswordController(req: Request, res: Response)
{
    const {email} = req.body;

    try
    {
        await Service.forgotPasswordService(email);

        return res.json({success: true, message: "Jeśli konto istnieje, wysłaliśmy maila z kodem"});
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode);
    }
}

export async function resetPasswordController(req: Request, res: Response)
{
    const {password, token} = req.body;

    try
    {
        await Service.resetPasswordService(password, token);

        return res.json({success: true});
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode);
    }
}

export async function refreshController(req: Request, res: Response)
{
    const {refreshToken} = req.cookies;

    try
    {
        const data = await Service.refreshService(refreshToken);

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
        const error = err as {message: string; statusCode: number};

        clearCookie(res)

    return errorHandler(res, error.message, error.statusCode);
    }
    
}

export async function logoutController(req: Request, res: Response)
{
    const {allDevices} = req.body;
    const {refreshToken} = req.cookies;

    try
    {
        await Service.logoutService(refreshToken, allDevices);

        clearCookie(res)

        return res.json({success: true})
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};

        clearCookie(res)

    return errorHandler(res, error.message, error.statusCode);
    }
    
}

export async function requireBeLoggedConroller(req: Request, res: Response, next: NextFunction)
{
    const {accessToken} = req.cookies;

    try
    {
        await Service.requireBeLoggedService(accessToken);

        next();
    }
    catch(err)
    {
        const error = err as {message: string; statusCode: number};
        return errorHandler(res, error.message, error.statusCode);
    }
}