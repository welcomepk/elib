import express from 'express'
import path from 'node:path'
import multer from 'multer'
import auth from '../middlewares/auth';
import { createBook, getAllBooks, getBookDetails, updateBook } from './bookController';

// store to local => then uploads to cloud
const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    limits: {
        fileSize: 3e7, // 30mb
    }
})

const bookRouter = express.Router();

bookRouter.get('/', getAllBooks)
bookRouter.get('/:bookId', getBookDetails)

bookRouter.post('/',
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'file', maxCount: 1 },
    ]),
    auth,
    createBook
)

bookRouter.patch('/:bookId',
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'file', maxCount: 1 },
    ]),
    auth,
    updateBook
)

export default bookRouter;