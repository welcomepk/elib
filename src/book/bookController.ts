import { Request, Response, NextFunction } from "express"

export const createBook = async(req:Request, res:Response, next:NextFunction) =>{
    res.send('book created')
}