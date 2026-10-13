import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDatabase } from './config/db.js';
import authRoutes from './api/routes/authRoutes.js'
import userRoutes from './api/routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import { testConnectToR2 } from './config/cloudflarer2.js';

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser())

app.use(cors({
  origin: process.env.URL,
  credentials: true,
}));

app.use(helmet())

//=======================strefa AI=================================================
const requiredEnv = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'USER_EMAIL',
    'USER_PASS',
    'URL',
    'STACK',
    'R2_URL',
    'R2_NAME',
    'R2_ACCESS_KEY',
    'R2_SECRET_ACCESS_KEY'
];

const missingEnv = requiredEnv.filter(
    name => !process.env[name]?.trim()
);

if (missingEnv.length > 0) {
    console.error(
        `Brak wymaganych zmiennych środowiskowych: ${missingEnv.join(', ')}`
    );

    process.exit(1);
}
//=====================================koniec strefy AI========================================

//routy
app.use('/auth', authRoutes)
app.use('/home', userRoutes)

connectDatabase();
testConnectToR2();
app.listen(PORT, () => {
    console.log(`Serwer running on port ${PORT}`);
});