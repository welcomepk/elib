import { config as conf } from "dotenv"

conf()

const _config = {
    port: process.env.PORT,
    dbConnectionUrl: process.env.MONGO_CONN_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinarySecretKey: process.env.CLOUDINARY_API_SECRET,
}



export const config = Object.freeze(_config)    