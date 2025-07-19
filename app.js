require('dotenv').config({ path: `${process.cwd()}/.env` });
const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');

// Routes
const adminRouter = require('./route/adminRoute');
const volunteerRouter = require('./route/volunteerRoute');
const providerRouter = require('./route/providerRoute');

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// app.use(cors({
//     origin: 'http://localhost:5173', // Or your frontend's URL in production
//     credentials: true // If you need to send cookies
// }));

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3001']; // Replace with your frontend URL
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // !origin allows tools like postman, and curl.
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// all routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/volunteer', volunteerRouter);
app.use('/api/v1/provider', providerRouter);

app.use(
    '*',
    catchAsync(async (req, res, next) => {
        throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    })
);

app.use(globalErrorHandler);
// app.use('/Images', express.static('./Images'))

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => {
    console.log('Main server up and running', PORT);
});