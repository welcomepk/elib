import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";
import userModel from "../user/userModel";

export interface AuthRequest extends Request {
    userId: string;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers['authorization']
    if (!token) {
        return next(createHttpError(401, 'Autherization token required.'))
    }
    try {
        const parsedToken = token?.split(' ')[1]
        const decoded = verify(parsedToken, config.jwtSecret as string)
        const _req = req as AuthRequest
        const user = await userModel.findById(decoded.sub)
        if (!user) throw Error('user not found')
        _req.userId = decoded.sub as string
        next()
    } catch (error) {
        console.log(error);

        return next(createHttpError(401, 'Token invalid or expired.'))
    }
}

export default auth;