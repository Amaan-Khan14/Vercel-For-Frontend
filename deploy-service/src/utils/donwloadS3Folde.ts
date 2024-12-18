import { S3 } from 'aws-sdk'
import path from 'path'
import fs from 'fs'

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const distPath = path.resolve(process.cwd(), 'dist')

export async function downloadS3Folder(S3Path: string) {
    try {
        const allFiles = await s3.listObjectsV2({
            Bucket: "vercel-frontend",
            Prefix: S3Path
        }).promise()

        const allPromise = allFiles.Contents?.map(async ({ Key }) => {

            // Return a promise to download the file from S3.
            return new Promise(async (resolve, reject) => {
                if (!Key) {
                    resolve("")
                    return
                }


                // Create a relative path for S3 key by removing the prefix from the key path and joining it with the dist path of the server code.
                const finalOutput = path.join(distPath, Key)

                // Create a directory if it does not exist.
                const dirName = path.dirname(finalOutput)
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true })
                }

                // Create a write stream to write the file to the server.
                const outputFile = fs.createWriteStream(finalOutput)

                // Download the file from S3 and write it to the server.
                const file = await s3.getObject({
                    Bucket: "vercel-frontend",
                    Key
                }).createReadStream()
                    .pipe(outputFile)
                    .on('finish', () => {
                        resolve("")
                    })
                    .on('error', (error) => {
                        fs.createWriteStream(finalOutput).close();
                        reject("Error downloading file from S3 " + error);
                    });
            })
        }) || []


        await Promise.all(allPromise?.filter(x => x !== undefined));

    } catch (error) {
        console.error('Error downloading file from S3', error)
    }
} 