import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { HttpError } from 'http-errors'

import { config } from './config/config'
import globalErrorHandler from './middlewares/globalErrorHandler'
import userRouter from './user/userRouter'
import bookRouter from './book/bookRouter'

const app = express()

app.use(express.json())

// routes
app.get('/', (req, res, next) => {
    const error = createHttpError(500, 'Something went wrong')
    throw error
    return res.json({'message': 'welcome to ebook api'})
})

// Routes
app.use('/api/users', userRouter)
app.use('/api/books', bookRouter)

// express provides global error handler middleware, which should be at last
app.use(globalErrorHandler)

export default app;