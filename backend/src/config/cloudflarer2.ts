import {S3Client} from '@aws-sdk/client-s3'

export const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_URL!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!
    }
});