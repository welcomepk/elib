import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
import UserModel from './userModel'
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";


export const createUser = async (req: Request, res: Response, next: NextFunction) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        const error = createHttpError(400, 'All fields are required')
        return next(error)
    }

    try {
        const user = await UserModel.findOne({ email })
        if (user) {
            const error = createHttpError(400, 'Email already in use.')
            return next(error)
        }
    } catch (error) {
        return next(createHttpError(500, 'Error while getting user'))
    }


    // password hashing before save
    const hashedPassword = await bcrypt.hash(password, 8)

    let newUser: User;
    try {
        newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword
        })
    } catch (error) {
        return next(createHttpError(500, 'Error while creating user'))
    }

    try {
        const accessToken = sign({ sub: newUser._id }, config.jwtSecret!, { expiresIn: '2h' })
        res.status(201).send({ accessToken })
    } catch (error) {
        return next(createHttpError(500, 'Error while signing jwt token.'))
    }

}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if (!email || !password)
        return next(createHttpError(400, 'All fields are required.'))

    let user;
    try {
        user = await UserModel.findOne({ email })
        if (!user)
            return next(createHttpError(400, 'User not found'))
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return next(createHttpError(400, 'username or password incorrect!'))
        const accessToken = sign({ sub: user._id }, config.jwtSecret as string, { expiresIn: '2h' })
        return res.send({ accessToken })
    } catch (error) {
        return next(createHttpError(500, 'Error while getting user.'))
    }
}