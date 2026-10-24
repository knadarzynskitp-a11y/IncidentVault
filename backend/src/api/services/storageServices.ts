import {Upload} from "@aws-sdk/lib-storage"
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import {Readable} from 'node:stream'
import {r2} from '../../config/cloudflarer2.js'
import { AppError } from "../middleware/errors/AppError.js"

export function createFileUpload(file: Readable, key: string)
{
    return new Upload({
        client: r2,
        params: {
            Bucket: process.env.R2_NAME,
            Key: key,
            Body: file,
            ContentType: "application/octet-stream"
        },
        queueSize: 1,
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false
    })
}

export async function deleteFile(key: string) {
    await r2.send(
        new DeleteObjectCommand({
            Bucket: process.env.R2_NAME!,
            Key: key
        })
    );
}

export async function getFile(key: string)
{
    const result = await r2.send(
        new GetObjectCommand({
            Bucket: process.env.R2_NAME!,
            Key: key
        })
    )

    if(!result.Body)
    {
        throw new AppError("R2 nie zwróciło zawartości pliku", 404)
    }

    if (!(result.Body instanceof Readable)) {
        throw new AppError("R2 nie zwróciło strumienia pliku", 502);
    }
    
    return result.Body;
}