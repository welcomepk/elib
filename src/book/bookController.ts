import { Request, Response, NextFunction } from "express"
import { Book } from "./bookTypes"
import fs from 'fs'
import BookModel from "./bookModel"
import cloudinary from "../config/cloudinary"
import createHttpError from "http-errors"
import { AuthRequest } from "../middlewares/auth"
import bookModel from "./bookModel"

export const createBook = async (req: Request, res: Response, next: NextFunction) => {

    const _req = req as AuthRequest

    const { title, genre } = req.body as { title: string, author: string, genre: string }
    const { coverImage, file } = req.files as { coverImage: Express.Multer.File[], file: Express.Multer.File[] }

    console.log(coverImage, file);

    if (!title || !genre || !coverImage || !file) {
        return next(createHttpError(400, 'All fields are required.'))
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    const fileSise = parseFloat(((files.file[0].size) / (1024 * 1024)).toFixed(2));

    if (fileSise > 10) {
        return next(createHttpError(400, 'File size should be less than of 10mb.'))
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
            author: _req.userId,
            coverImage: bookCoverImageuploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        })
        await fs.promises.unlink(files.coverImage[0].path)
        await fs.promises.unlink(files.file[0].path)

        return res.send({
            book: newBook,
        })
    } catch (error) {
        console.log(error);
        return next(error)
    }

}

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {

    const { coverImage, file } = req.files as { coverImage: Express.Multer.File[], file: Express.Multer.File[] } || { coverImage: "", file: "" }
    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({ _id: bookId })
    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }
    console.log("testts");

    const _req = req as AuthRequest
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "Unauthorized to modify this resource."));
    }

    let completeFile = ''
    let completeCoverImage = ""
    try {
        if (coverImage) {
            const coverImageMimeType = coverImage[0].mimetype.split('/').at(-1)
            const filePath = coverImage[0].path
            const filename = `${coverImage[0].filename}.${coverImageMimeType}`

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                filename_override: filename,
                folder: 'book-covers',
                format: coverImageMimeType,
            })
            completeCoverImage = uploadResult.secure_url
            await fs.promises.unlink(filePath)
        }

        if (file) {
            const fileMimeType = file[0].mimetype.split('/').at(-1)
            const filePath = file[0].path
            const filename = `${file[0].filename}.${fileMimeType}`

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                resource_type: 'raw',
                filename_override: filename,
                folder: 'book-pdfs',
                format: fileMimeType,
            })
            completeFile = uploadResult.secure_url
            await fs.promises.unlink(filePath)
        }
    } catch (error) {
        return next(error)
    }

    try {
        const updatedBook = await bookModel.findByIdAndUpdate(bookId, {
            title,
            genre,
            coverImage: completeCoverImage || book.coverImage,
            file: completeFile || book.file,
        }, { new: true })
        return res.send(updatedBook)
    } catch (error) {
        return next(error)
    }


}

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId
    const _req = req as AuthRequest
    try {
        // delete cloudinary images
        const book = await bookModel.findById(bookId)
        if (!book) {
            return next(createHttpError(404, 'Book not found'))
        }
        if (book.author.toString() !== _req.userId) {
            return next(createHttpError(403, 'Unauthorized to delete this resource'))
        }

        // https://res.cloudinary.com/dfcm5xrlw/image/upload/v1713593670/book-covers/jwbs1bvdtby1q754bksn.jpg
        const coverFileSplits = book.coverImage.split("/");
        const coverImagePublicId = coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

        const bookFileSplits = book.file.split("/");
        const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);

        try {
            await cloudinary.uploader.destroy(coverImagePublicId)
            await cloudinary.uploader.destroy(bookFilePublicId, {
                resource_type: 'raw'
            })

        } catch (error) {
            return next(error)
        }

        await bookModel.findByIdAndDelete(bookId)
        return res.status(204).send({ message: "book deleted" })
    } catch (error) {
        return next(error)
    }
}
export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const books = await bookModel.find({}).populate('author', 'name email')
        return res.send(
            books
        )
    } catch (error) {
        return next(error)
    }
}

export const getBookDetails = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId
    try {
        const book = await bookModel.findById(bookId).populate('author', 'name email')
        if (!book) {
            return next(createHttpError(404, 'Book not found'))
        }
        return res.send({
            book
        })
    } catch (error) {
        return next(error)
    }
}