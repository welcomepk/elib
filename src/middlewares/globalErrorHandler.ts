import createHttpError, { HttpError } from 'http-errors'
import { NextFunction, Response, Request } from 'express';
import { config } from '../config/config';


export default function globalErrorHandler(err:HttpError, req:Request, res:Response, next:NextFunction)  {
    const statusCode = err.statusCode || 500
    
    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env === 'development' ? err.stack : ''
    })
}