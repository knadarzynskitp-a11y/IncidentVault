import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(helmet())

app.listen(PORT, () => {
    console.log(`Serwer running on port ${PORT}`);
});