import { Request, Response, NextFunction } from "express"
import { Book } from "./bookTypes"
import BookModel from "./bookModel"
import cloudinary from "../config/cloudinary"
import createHttpError from "http-errors"

export const createBook = async (req: Request, res: Response, next: NextFunction) => {

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    const fileSise = parseFloat(((files.file[0].size) / (1024 * 1024)).toFixed(2));

    if (fileSise > 30) {
        return next(createHttpError(400, 'File size should be less than of 30mb.'))
    }

    let bookCoverImageuploadResult;
    let bookFileUploadResult;

    try {
        const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1)
        const filePath = files.coverImage[0].path
        const filename = `${files.coverImage[0].filename}.${coverImageMimeType}`


        const bookFilename = files.file[0].filename
        const bookFilePath = files.file[0].path
        // book cover image upload to cloudinary
        bookCoverImageuploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: filename,
            folder: 'book-covers',
            format: coverImageMimeType,
        })
        // file upload to cloudinary
        bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: 'raw',
            filename_override: bookFilename,
            folder: 'book-pdfs',
            format: 'pdf',
        })
    } catch (error) {
        console.log(error);
        return next(error)
    }



    // create a new book
    try {
        const newBook = await BookModel.create({
            ...req.body,
            coverImage: bookCoverImageuploadResult.url,
            file: bookFileUploadResult.url,
        })
        return res.send({
            book: newBook,
        })
    } catch (error) {
        console.log(error);
        return next(error)
    }

}