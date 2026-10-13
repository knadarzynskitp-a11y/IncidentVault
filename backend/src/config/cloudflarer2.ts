import {S3Client} from '@aws-sdk/client-s3'
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_URL!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    }
});

export async function testConnectToR2()
{
    try
    {
        const result = await r2.send(
            new ListObjectsV2Command({
                Bucket: process.env.R2_NAME
            })
        )
        console.log("Pomyślnie połączono z usługą cloudflare")
    }
    catch(err)
    {
        console.error("Błąd połączenia z r2: ", err);
        process.exit(1)
    }
}
