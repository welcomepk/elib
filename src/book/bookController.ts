import { Request, Response, NextFunction } from "express"
import { Book } from "./bookTypes"
import bookModel from "./bookModel"
import cloudinary from "../config/cloudinary"
import createHttpError from "http-errors"

export const createBook = async (req: Request, res: Response, next: NextFunction) => {

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    const fileSise = parseFloat(((files.file[0].size) / (1024 * 1024)).toFixed(2));
    if (fileSise > 30) {
        return next(createHttpError(400, 'File size should be less than of 30mb.'))
    }

    // book cover image upload to cloudinary
    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1)
    const filePath = files.coverImage[0].path
    const filename = `${files.coverImage[0].filename}.${coverImageMimeType}`
    const bookCoverImageuploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: filename,
        folder: 'book-covers',
        format: coverImageMimeType,
    })

    // file upload to cloudinary
    const bookFilename = files.file[0].filename
    const bookFilePath = files.file[0].path
    try {
        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: 'raw',
            filename_override: bookFilename,
            folder: 'book-pdfs',
            format: 'pdf',
        })
        console.log(bookFileUploadResult);
    } catch (error) {
        console.log(error);

    }

    console.log(bookCoverImageuploadResult);

    return res.send()

}