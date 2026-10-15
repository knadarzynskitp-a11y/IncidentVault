import {Upload} from "@aws-sdk/lib-storage"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import type {Readable} from 'node:stream'
import {r2} from '../../config/cloudflarer2.js'

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