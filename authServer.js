require('dotenv').config({ path: `${process.cwd()}/.env` });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Routes
const authRouter = require('./route/authRoute');

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// const allowedOrigins = ['http://localhost:5173', 'http://localhost:3001']; // Replace with your frontend URL
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // !origin allows tools like postman, and curl.
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true, // Allow cookies to be sent
// };

// app.use(cors(corsOptions));

app.use(cors({
    origin: 'http://localhost:5173', // Or your frontend's URL
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// all routes
app.use('/api/v1/auth', authRouter);

app.use(
    '*',
    catchAsync(async (req, res, next) => {
        throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    })
);

app.use(globalErrorHandler);
// app.use('/Images', express.static('./Images'))

const PORT = process.env.AUTH_PORT || 4000; 

app.listen(PORT, () => {
    console.log('Auth server up and running', PORT);
});