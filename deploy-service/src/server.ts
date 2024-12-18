import { commandOptions, createClient } from "redis";
import { downloadS3Folder } from "./utils/donwloadS3Folde";

const client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .on('connect', () => console.log('Redis Client Connected'))
    .connect();


export async function getIdFromQueue() {
    while (1) {
        const response = await client.blPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
        )

        console.log('Response', response)
        await downloadS3Folder(`output/${response?.element}`)
    }

}

getIdFromQueue()