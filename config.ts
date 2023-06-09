import fs from 'fs';
import { Sequelize } from 'sequelize';

if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: './config.env' });
} else {
    require('dotenv');
}

const convertToLogLevel = (value: string) => {
    var log: any = false;
    if (typeof value === "string") {
        if (value.toLowerCase() === "true") {
            log = console.log;
        }
    }
    return log;
}
// Declare these environment variables first
process.env.DATABASE_URL = './BotsApp.db';
process.env.DEBUG = 'false';
const config = {
    NEWS_API_URL:process.env.NEWS_API_URL,
    STRING_SESSION: '',
    HEROKU: false,
    PREFIX: "^[.?!]",
    COUNTRY_CODE: "91",
    OCR_API_KEY:process.env.OCR_API_KEY,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    DATABASE_URL: './BotsApp.db',
    DEBUG: false,
    DATABASE: process.env.DATABASE_URL === './BotsApp.db' ?
        new Sequelize({
            dialect: "sqlite",
            storage: process.env.DATABASE_URL,
            logging: convertToLogLevel(process.env.DEBUG)
        }) :
        new Sequelize(process.env.DATABASE_URL,
            {
                dialect: 'postgres',
                protocol: 'postgres',
                logging: convertToLogLevel(process.env.DEBUG),
                dialectOptions:
                {
                    ssl:
                    {
                        require: true,
                        rejectUnauthorized: false
                    }
                }
            }),
    WORK_TYPE: "public", //anyone can we this bot where you will be common // can use private  when you only want to use
    SUDO: "",
    OFFLINE_RESPONSE: true,
}
export default config;
