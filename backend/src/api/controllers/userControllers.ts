import errorHandler from "../middleware/errors/errorHandler.js"
import * as Service from '../services/userService.js'
import type { Request, Response } from 'express';
import busboy from 'busboy';
import { createHash } from 'node:crypto';
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

/*
export async function addEvidenceFileController(req: Request, res: Response)
{
    try
    {
        const user_id = res.locals.user_id;
        const evidence_id = Number(req.params.evidenceId);
        // Najpierw sprawdzamy dostęp do dowodu.
        await Service.checkEvidenceUploadAccess(user_id, evidence_id);

        if (!req.is('multipart/form-data')) {
            throw new AppError("Wyślij plik jako multipart/form-data", 400);
        }

        let parser: ReturnType<typeof busboy>;

        try {
            parser = busboy({
                headers: req.headers,
                limits: {
                    files: 1,
                    fields: 0,
                    fileSize: 10 * 1024 * 1024 // 10 MiB na początek
                }
            });
        } catch {
            throw new AppError("Nieprawidłowy formularz pliku", 400);
        }

        const hash = createHash('sha256');

        let original_name = '';
        let mime_type = '';
        let size_bytes = 0;
        let receivedFile = false;
        let limitExceeded = false;
        let wrongField = false;

        parser.on('file', (fieldName, file, info) => {
            // Oczekujemy pola formularza o nazwie "file".
            if (fieldName !== 'file') {
                wrongField = true;
                file.resume(); // Odczytaj i odrzuć ten strumień.
                return;
            }

            receivedFile = true;
            original_name = info.filename;
            mime_type = info.mimeType;

            file.on('data', (chunk: Buffer) => {
                size_bytes += chunk.length;
                hash.update(chunk);
            });

            file.on('limit', () => {
                limitExceeded = true;
            });

            file.on('error', (err) => {
                parser.destroy(err);
            });
        });

        parser.on('filesLimit', () => {
            limitExceeded = true;
        });

        parser.on('fieldsLimit', () => {
            limitExceeded = true;
        });

        // Przekazuje przychodzące dane do Busboy i czeka na koniec.
        try {
            await pipeline(req, parser);
        } catch {
            throw new AppError("Przerwany lub nieprawidłowy upload", 400);
        }

        if (limitExceeded) {
            throw new AppError(
                "Dozwolony jest jeden plik do 10 MiB, bez dodatkowych pól",
                413
            );
        }

        if (wrongField || !receivedFile || !original_name) {
            throw new AppError("Dodaj plik w polu o nazwie file", 400);
        }

        // Ostateczny hash obliczamy dopiero po odebraniu całego pliku.
        const sha256_hash = hash.digest('hex');

        return res.json({
            message: "Plik odebrano testowo. Nie został zapisany.",
            evidence_id,
            original_name,
            mime_type,
            size_bytes,
            sha256_hash
        });
    } catch (err) {
        // Po zerwaniu połączenia nie można już wysłać odpowiedzi.
        if (res.destroyed || res.headersSent) return;

        if (err instanceof AppError) {
            return errorHandler(res, err.message, err.statusCode);
        }

        console.error(err);
        return errorHandler(res, "Błąd odbierania pliku", 500);
    }
}
*/
