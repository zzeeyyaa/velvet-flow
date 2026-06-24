import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
    return c.text('VelvetFlow Backend is running!')
})

export default app