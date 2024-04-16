import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import User from './userModel'

export const createUser = async(req:Request, res:Response, next:NextFunction) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        const error = createHttpError(400, 'All fields are required')
        return next(error)
    }
    const user = await User.findOne({email})
    if(user) {
        const error = createHttpError(400, 'Email already in use.')
        return next(error)
    }

    // password hashing before save
    const hashedPassword = bcrypt.hash(password, 8)
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword
    })

    
}