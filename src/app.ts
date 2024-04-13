import express from 'express'

const app = express()

// routes
app.get('/', (req, res, next) => {
    return res.json({'message': 'welcome to ebook api'})
})

export default app;