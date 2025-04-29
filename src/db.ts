import dotenv from "dotenv";
import {DataSource} from "typeorm";
import {Collection, Product, ProductImage} from "./entities";

dotenv.config();



export const DB = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [Product, Collection, ProductImage],
});