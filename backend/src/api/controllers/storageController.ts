import * as Repo from '../repository/userRepo.js';
import busboy from 'busboy';
import { createHash, randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { AppError } from '../middleware/errors/AppError.js';
import errorHandler from "../middleware/errors/errorHandler.js"
import * as Service from '../services/userService.js'
import type { Request, Response } from 'express';
import * as ServiceStorage from '../services/storageServices.js'

export async function addEvidenceFileController(req: Request, res: Response)
{
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const storage_key = `evidences/${randomUUID()}`;

    let activeFile: Readable | undefined;
    let uploadTask: Promise<void> | undefined;
    let uploadFailure: AppError | undefined;
    let databaseWriteStarted = false;

    try
    {
        const user_id = res.locals.user_id;
        const evidence_id = Number(req.params.evidenceId)

        await Service.checkEvidenceUploadAccess(user_id, evidence_id);

        if(!req.is('multipart/form-data'))
        {
            throw new AppError("Wyślij plik jako multipart/form-data", 400)
        }

        let parser: ReturnType<typeof busboy>;

        try
        {
            parser = busboy({
                headers: req.headers,
                limits: {
                    files: 1,
                    fields: 0,
                    fileSize: MAX_FILE_SIZE + 1
                }
            })
        }
        catch(err)
        {
            throw new AppError('Nieprawidłowy formularz pliku', 400)
        }

        const hash = createHash('sha256');

        let original_name = '';
        let mime_type = '';
        let size_bytes = 0;
        let receivedFile = false;
       
        const stopUpload = (error: AppError) => {
            if (uploadFailure) return;

            uploadFailure = error;

            queueMicrotask(() => {
                activeFile?.destroy(error);
                parser.destroy(error);
            });
        };

        parser.on('file', (fieldName, file, info) => {

            activeFile = file;

            file.on('error', () => {
                stopUpload(new AppError("Błąd odbierania pliku", 400));
            });

            if(fieldName !== 'file')
            {
                stopUpload(new AppError("Dodaj plik w polu file", 400))
                return;
            }

            original_name = info.filename ?? '';
            mime_type = info.mimeType;

            if (!original_name || original_name.length > 255 || mime_type.length > 100) {
                stopUpload(new AppError("Nieprawidłowa nazwa lub typ pliku", 400));
                return;
            }

            receivedFile = true;

            file.on('data', (chunk: Buffer) => {
                size_bytes += chunk.length;

                if (size_bytes > MAX_FILE_SIZE) {
                    stopUpload(new AppError("Plik przekracza limit 10 MiB", 413));
                    return;
                }

                hash.update(chunk)
            });

            file.on('limit', () => {
                stopUpload(new AppError("Plik przekracza limit 10 MiB", 413))
            });

            try {
                const upload = ServiceStorage.createFileUpload(file, storage_key);

                // Rozpoczynamy wysyłanie teraz, czekamy na wynik później.
                uploadTask = upload.done().then(
                    () => {},
                    (err) => {
                        console.error("Błąd uploadu do R2:", err);

                        stopUpload(
                            new AppError(
                                "Nie udało się zapisać pliku w R2",
                                502
                            )
                        );
                    }
                );
            } catch {
                stopUpload(
                    new AppError("Nie udało się rozpocząć uploadu", 500)
                );
            }
        });
        parser.on('filesLimit', () => {
            stopUpload(new AppError("Dozwolony jest jeden plik na żądanie", 400));
        });

        parser.on('fieldsLimit', () => {
            stopUpload(new AppError("Ten endpoint przyjmuje tylko plik", 400));
        });

        // Przekazuje przychodzące dane do Busboy i czeka na koniec.
        try
        {
            await pipeline(req, parser);
        }
        catch(err)
        {
            throw uploadFailure ?? new AppError("Przerwany lub nieudany upload", 400)
        }

        

        if (!receivedFile || !uploadTask) {
            throw new AppError("Nie przesłano pliku", 400);
        }

        await uploadTask;

        if (uploadFailure) {
            throw uploadFailure;
        }

        const sha256_hash = hash.digest('hex');

        await Service.checkEvidenceUploadAccess(user_id, evidence_id);

        databaseWriteStarted = true;

        const savedFile = await Repo.addEvidenceFile({
            evidence_id,
            uploaded_by: user_id,
            original_name,
            storage_key,
            mime_type,
            size_bytes,
            sha256_hash
        });

        if (!res.destroyed && !res.headersSent) {
            return res.status(201).json({
                success: true,
                file_id: savedFile.id
            });
        }
    }
    catch (err) {
        activeFile?.destroy();
        await uploadTask;

        if (uploadTask && !databaseWriteStarted) {
            try {
                await ServiceStorage.deleteFile(storage_key);
            } catch (cleanupError) {
                console.error(
                    "Nie udało się usunąć obiektu R2:",
                    storage_key,
                    cleanupError
                );
            }
        } else if (databaseWriteStarted) {
            console.error(
                "Sprawdź zapis pliku dla storage_key:",
                storage_key,
                err
            );
        }

        if (res.destroyed || res.headersSent) return;

        if (err instanceof AppError) {
            return errorHandler(res, err.message, err.statusCode);
        }

        console.error(err);
        return errorHandler(res, "Wystąpił nieoczekiwany błąd", 500);
    }
}



