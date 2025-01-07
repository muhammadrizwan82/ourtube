import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: process.env.REQUEST_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_LIMIT }));
app.use(express.static('public'));
app.use(cookieParser());

app.get('/index', (req, res) => {
    res.status(200).json({
        message: 'ok'
    })
    console.log(req)
});
// routes
import userRouter from './routes/user.routes.js'
import categoryRouter from './routes/category.routes.js'

// routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/category', categoryRouter);
export { app }