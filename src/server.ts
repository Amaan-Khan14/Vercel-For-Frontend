import express from 'express'
import cors from 'cors'
import { simpleGit } from 'simple-git';
import path from 'path'
import { generateRandomId } from './utils/randomId';
import { getAllFiles } from './utils/getAllFiles';
import { uploadFiles } from './utils/uploadFiles';
import { buildQueue } from './utils/buildQueue';

const git = simpleGit()
const app = express()
app.use(express.json())
app.use(cors())

const distPath = path.resolve(process.cwd(), 'dist')

app.post('/get/url', async (req, res) => {
    const repoUrl = req.body.url
    const randomId = generateRandomId()

    const clonePath = path.join(distPath, 'output', randomId)

    try {

        // Clone the repository.
        await git.clone(repoUrl, clonePath)
        const files = getAllFiles(clonePath)
        console.log(files)

        console.log('reached1')

        const uploadPromises = files.map(async (localFilePath) => {
            // Create a relative path for S3 key
            const relativePath = path.relative(clonePath, localFilePath)
            // Use forward slashes for S3 key
            const s3Key = path.posix.join('output', randomId, relativePath)
            return uploadFiles(s3Key, localFilePath)
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        buildQueue(randomId)

        res.json({ success: true, id: randomId })
    } catch (error) {
        console.error('Clone error:', error)
        res.status(500).json({ error: 'Failed to clone repository' })
    }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})