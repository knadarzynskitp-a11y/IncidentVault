import type { Response } from "express";

export function clearCookie(res: Response)
{
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.STACK === "production",
        sameSite: "strict",
        path: "/"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.STACK === "production",
        sameSite: "strict",
        path: "/"
    });
}