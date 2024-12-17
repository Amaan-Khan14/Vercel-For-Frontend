import { createClient } from 'redis';

const client = createClient()
client.on('error', (error) => {
    console.error('Redis error:', error)
})
client.connect()

export const buildQueue = async (id: string) => {
    try {
        await client.LPUSH(
            'build-queue',
            id
        )
    } catch (error) {
        console.error('Redis error:', error)
    }
}