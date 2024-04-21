import express from 'express'
import cors from 'cors'
import globalErrorHandler from './middlewares/globalErrorHandler'
import userRouter from './user/userRouter'
import bookRouter from './book/bookRouter'

const app = express()

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173'
}))



// Routes
app.use('/api/users', userRouter)
app.use('/api/books', bookRouter)

// express provides global error handler middleware, which should be at last
app.use(globalErrorHandler)

export default app;