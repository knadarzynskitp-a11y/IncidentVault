import { AppError } from "../middleware/errors/AppError.js";

export function handleServiceError(err: any): never {
    if (err instanceof AppError) {
        throw err;
    }

    if (process.env.STACK !== "production") {
        throw new AppError(err.message, err.statusCode || 500);
    }

    throw new AppError("Wystąpił nieoczekiwany błąd", 500);
}