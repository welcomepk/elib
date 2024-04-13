import { config as conf } from "dotenv"

conf()

const _config = {
    port: process.env.PORT,
    dbConnectionUrl: process.env.MONGO_CONN_STRING
}

console.log(_config.port);

export const config = Object.freeze(_config)    