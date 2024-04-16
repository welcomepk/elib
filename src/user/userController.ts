import { Request, Response, NextFunction } from "express"

export const createUser = async(req:Request, res:Response, next:NextFunction) => {
    
    res.json({
        message: req.body['name']
    })
}