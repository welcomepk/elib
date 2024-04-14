import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { HttpError } from 'http-errors'

import { config } from './config/config'
import globalErrorHandler from './middlewares/globalErrorHandler'
import userRouter from './user/userRouter'

const app = express()

// routes
app.get('/', (req, res, next) => {
    const error = createHttpError(500, 'Something went wrong')
    throw error
    return res.json({'message': 'welcome to ebook api'})
})

// Routes
app.use('/api/users', userRouter)

// express provides global error handler middleware, which should be at last
app.use(globalErrorHandler)

export default app;