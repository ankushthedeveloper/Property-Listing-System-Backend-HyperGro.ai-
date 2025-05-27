import express from 'express'
import helmet from 'helmet';
import cors from 'cors'
import connect from '@helpers/db';
import { ValidateEnv } from '@config/env.config';
import { ErrorMessages } from '@constants/error.constants';
import userRoutes from '@routes/user.routes'
import propertyRoutes from '@routes/property.routes'
import favoriteRoutes from '@routes/favorite.routes'
import dotenv from 'dotenv';
import DomPurifyMiddleware from 'middlewares/DomPurify';
import mongoSanitizeMiddleware from 'middlewares/mongoSanitize';
dotenv.config();

const server = express();
ValidateEnv();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error(ErrorMessages.CORS_ERROR), false);
    }

    return callback(null, true);
  },
  credentials: true,
};

server.use(cors(corsOptions));
server.use(
  express.json({
    limit: "20mb",
  })
);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(helmet());
server.use(helmet.noSniff());
server.use(helmet.referrerPolicy({ policy: "no-referrer" }));
server.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);
server.use(DomPurifyMiddleware);
// server.use(mongoSanitizeMiddleware);
connect();
server.use('/api/v1/users',userRoutes);
server.use('/api/v1/properties',propertyRoutes);
server.use('/api/v1/favorites',favoriteRoutes);

server.listen(process.env.PORT,()=>{
    console.log("Server connected")
})