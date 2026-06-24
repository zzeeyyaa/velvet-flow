import { Hono } from 'hono'
import indexRoute from './routes/index'

const app = new Hono()

// Mount routes: semua request ke '/' akan diarahkan ke indexRoute
app.route('/', indexRoute)

export default app