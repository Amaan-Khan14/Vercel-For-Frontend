import { S3 } from 'aws-sdk'
import fs from 'fs'

export const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})


export const uploadFiles = async (filePath: string, localFilePath: string) => {
    // Read the file content.
    const fileStream = fs.createReadStream(localFilePath)

    // Upload the file to the S3 bucket.
    try {
        const response = await s3.upload({
            Key: filePath,
            Body: fileStream,
            Bucket: "vercel-frontend",
        }).promise()

        return response
    } catch (error) {
        console.error('Upload error:', error)
    }

}