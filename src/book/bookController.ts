import { Request, Response, NextFunction } from "express"
import { Book } from "./bookTypes"
import bookModel from "./bookModel"

export const createBook = async(req:Request, res:Response, next:NextFunction) =>{
    res.send('book created')
}