const Admin = require('../db/models/admin');
const Provider = require('../db/models/provider');
const Volunteer = require('../db/models/volunteer');
const RefreshToken = require('../db/models/refreshtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multer = require('multer')
const fs = require('fs-extra')
const path = require('path')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { DateTime } = require('luxon');
const { Op } = require('sequelize');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_JWT_SECRET_KEY, {
        expiresIn: process.env.ACCESS_JWT_EXPIRES_IN,
    });
};

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

const customStorage = (theUser, theField, orgFileName) =>
    {
        if (!['1', '2'].includes(theUser))
            throw new AppError('نوع المستخدم غير صالح', 400);
      
        if (!['profilePicture', 'authDoc', 'cv'].includes(theField))
            throw new AppError('اسم الحقل غير صالح', 422);
        
        if (!orgFileName)
            throw new AppError('اسم الملف الأصلي مفقود', 400);

        let usertype = '';
        let destinationPath = '';

        if ( theUser === '1') usertype = 'provider'
        else if ( theUser === '2') usertype = 'volunteer';

        switch(theField){
            case 'profilePicture':
                destinationPath = `uploads/images/${usertype}/`; break;
            case 'authDoc':
                destinationPath = 'uploads/authDocs/'; break;
            case 'cv':
                destinationPath = `uploads/cvs/`; break;
            default: throw new AppError('اسم الحقل غير صالح', 400);
        }
        
        return `${destinationPath + orgFileName.split('.')[0]}-${Date.now() + path.extname(orgFileName)}`
}

const uploadTo = () => multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: '3000000' },
    fileFilter: (req, file, cb) => {
        let fileTypes = ''
        if (file.fieldname === 'profilePicture')
            fileTypes = /jpeg|jpg|png|gif/

        else if (['authDoc', 'cv'].includes(file.fieldname))
            fileTypes = /pdf/

        else return cb(new AppError('اسم الحقل غير صالح', 422)); 

        const mimeType = fileTypes.test(file.mimetype)  
        const extname = fileTypes.test(path.extname(file.originalname))
        if(mimeType && extname) {
            return cb(null, true)
        }
        cb(new AppError('نوع الملف الذي تحاول رفعه غير مناسب', 415))
    }
}).fields([
    {name: 'profilePicture', maxCount: 1},
    {name: 'authDoc', maxCount: 1},
    {name: 'cv', maxCount: 1}]);

const bufferToFile = async (bufferData, filePath) => {
    const myBuffer = Buffer.from(bufferData, 'utf-8');
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, myBuffer, (err) => {
        if (err) {
          reject(err); 
        } else {
          resolve(); 
        }
      });
    });
};

const signup = catchAsync(async (req, res, next) => {
    const body = req.body;
    const userType = req.params.userType;
    let newUser = "";
  
    let orgFileName = "";
    let filePath = "";
  
    if (userType === "1") {
      if (!req.files.profilePicture || !req.files.authDoc) {
        console.log("Profile Picture File:", req.files.profilePicture);
        console.log("CV File:", req.files.cv);
        console.log("File paths:", filePath);
        return next(new AppError("يرجى تحميل الملفات المطلوبة", 401));
      }
  
      orgFileName = [
        req.files.profilePicture[0].originalname,
        req.files.authDoc[0].originalname,
      ];
      filePath = [
        customStorage("1", "profilePicture", orgFileName[0]),
        customStorage("1", "authDoc", orgFileName[1]),
      ];
  
      newUser = await Provider.create({
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
        providerName: body.providerName,
        industry: body.industry,
        location: body.location,
        estDate: body.estDate,
        authDoc: filePath[1],
        providerBio: body.providerBio,
        profilePicture: filePath[0],
      });
  
      await bufferToFile(req.files.profilePicture[0].buffer, filePath[0]);
      await bufferToFile(req.files.authDoc[0].buffer, filePath[1]);
    } else if (userType === "2") {
      console.log("we are in function");
      if (!req.files.profilePicture)
        return next(new AppError("يرجى رفع الصورة الشخصية", 401));
  
      orgFileName = req.files.profilePicture[0].originalname;
      filePath = customStorage("2", "profilePicture", orgFileName);
      console.log("we are creating");
  
      console.log("Received eduLevel:", req.body.eduLevel);
  
      const eduLevel = JSON.parse(req.body.eduLevel);
    //   const eduLevel = req.body.eduLevel;
  
      console.log("JSON eduLevel:", eduLevel);
  
      try {
        newUser = await Volunteer.create({
          email: body.email,
          password: body.password,
          confirmPassword: body.confirmPassword,
          firstName: body.firstName,
          lastName: body.lastName,
          birthDate: body.birthDate,
          nationality: body.nationality,
          countryResidence: body.countryResidence,
          martialStatus: body.martialStatus,
          gender: body.gender,
          chronicDiseases: body.chronicDiseases,
          specialNeeds: body.specialNeeds,
          eduLevel: eduLevel,
          eduMajor: body.eduMajor,
          laborSector: body.laborSector,
          cv: req.files.cv
            ? customStorage("2", "cv", req.files.cv[0].originalname)
            : null,
          voulnteerBio: body.voulnteerBio,
          profilePicture: filePath,
        });
        console.log("New user created:", newUser);
      } catch (error) {
        console.error("Error during user creation:", error);
        return next(new AppError("Error creating user", 500));
      }
      console.log(req.body);
      await bufferToFile(req.files.profilePicture[0].buffer, filePath);
      if (req.files.cv) await bufferToFile(req.files.cv[0].buffer, newUser.cv);
    }
  
    if (!newUser) {
      return next(new AppError("فشل إنشاء المستخدم", 400));
    }
  
    const result = newUser.toJSON();
    delete result.password;
  
    return res.status(201).json({
      status: "success",
      data: result,
    });
  });

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const userType = req.params.userType;
    let ut = "";

    if (!email || !password)
        return next(new AppError('يرجى كتابة البريد الإلكتروني وكلمة المرور', 400));

    switch (userType) {
        case '0':
            ut = Admin; break;
        case '1':
            ut = Provider; break;
        case '2': ut = Volunteer; break;
        default: throw new AppError('نوع المستخدم غير صالح', 400);
    }
    
    const result = await ut.findOne({
        where: {email}
         });

    if (!result || !(await bcrypt.compare(password, result.password))) {
        return next(new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
    };

    if (ut === Provider && result.verified === 'Pending'){
        return next(new AppError('الآدمن لم يتحقق من حسابك بعد', 401));
    }
    else if (ut === Provider && result.verified === 'Rejected'){
        return next(new AppError('لقد تم رفض طلب إنشاء حسابك', 401));
    }

    const oldRT = await RefreshToken.findOne({
        where: {
            userId: result.id,
            userType: userType
         }});
    if (oldRT) await oldRT.destroy();

    const accessToken = generateAccessToken({
        id: result.id,
        userType: userType
    });

    const refreshToken = generateRefreshToken();

    let exp = DateTime.now();
    exp = exp.plus({ months: parseInt(process.env.REFRESH_JWT_EXPIRES_IN) });    

    const newRefreshToken = await RefreshToken.create({ 
        token: refreshToken,
        userId: result.id,
        userType,
        expiresAt: exp
    });
    if (!newRefreshToken) return next( new AppError("فشل في إنشاء رمز التحديث", 500));

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        // sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        // sameSite: 'strict',
        path: "/api/v1/auth/refresh",
        maxAge: 4 * 30 * 24 * 60 * 60 * 1000,
        // path: '/'
    });

    return res.json({
        status: 'success',
        "accessToken": accessToken,
        "refreshToken": refreshToken,
        data: result,
    });
});


const authentication = catchAsync(async (req, res, next) => {
    const token = req.cookies.accessToken;
    let ut = '';

    if (!token) return next(new AppError('الرجاء تسجيل الدخول', 401));

    const tokenDetail = jwt.verify(token, process.env.ACCESS_JWT_SECRET_KEY);

    switch (tokenDetail.userType) {
        case '0': ut = Admin; break;
        case '1': ut = Provider; break;
        case '2': ut = Volunteer; break;
        default: throw new AppError('نوع المستخدم غير صالح', 400);
    }

    const freshUser = await ut.findByPk(tokenDetail.id);

    if (!freshUser) return next(new AppError('المستخدم لم يعد موجودا', 400));

    req.user = freshUser;
    console.log("=============================")
    console.log(Date(tokenDetail.exp))
    console.log("=============================")
    return next();
});

const restrictTo = (...userType) => {
    const checkPermission = (req, res, next) => {        
        let theUser = req.user

        if (theUser instanceof Provider)
            theUser = 'provider'
        else if (theUser instanceof Volunteer)
            theUser = 'volunteer'
        else if (theUser instanceof Admin)
            theUser = 'admin'

        if (!userType.includes(theUser)) {
            return next(
                new AppError("ليس لديك الإذن بتنفيذ هذا الإجراء", 403)
            );
        }
        return next();
    };

    return checkPermission;
};

const refresh = catchAsync(async (req, res, next) => {    
    let ut = "";
    const cookieAT = req.cookies.accessToken;
    const cookieRT = req.cookies.refreshToken;
    if (!cookieAT || !cookieRT)
    return next( new AppError("لم يتم العثور على ملف تعريف الارتباط", 401) );

    const ATdetails = jwt.verify(cookieAT, process.env.ACCESS_JWT_SECRET_KEY, { ignoreExpiration: true });
    const where = {id: ATdetails.id};

    switch (ATdetails.userType) {
        case '0': ut = Admin; break;
        case '1': ut = Provider; where.verified = { [Op.like]: 'Accepted' } ; break;
        case '2': ut = Volunteer; break; default: throw new AppError('نوع المستخدم غير صالح', 400);
    }
    
    userExist = await ut.findOne({ where })
    if (!userExist) return next(new AppError('المستخدم غير موجود', 401));

    mytoken = await RefreshToken.findOne({
        where: {
            userId: ATdetails.id,
            userType: ATdetails.userType,
            expiresAt: {[Op.gt]: new Date()}
        }
    })
    if (!mytoken || !(await bcrypt.compare(cookieRT, mytoken.token)))
        return next( new AppError("لا يوجد رمز صالح", 401) );

    const accessToken = generateAccessToken({
        id: mytoken.userId,
        userType: mytoken.userType,
    });
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        // sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });

    return res.json({
        status: 'success',
        msg: "New access generated",
        "accessToken": accessToken,
    });
})

const logout = catchAsync(async (req, res, next) => {
    const cookieAT = req.cookies.accessToken;
    if (!cookieAT)
        return next( new AppError("لم يتم العثور على ملف تعريف الارتباط", 401) );

    const ATdetails = jwt.verify(cookieAT, process.env.ACCESS_JWT_SECRET_KEY, { ignoreExpiration: true });

    const result = await RefreshToken.findOne({
        where: {
            userId: ATdetails.id,
            userType: ATdetails.userType,
         }
    });
    if (!result)
        return next(new AppError('لم يتم العثور على رمز التحديث', 400));

    await result.destroy();
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    

    return res.json({
        status: 'success',
        message: 'User logged out successfully',
    }); 
});

module.exports = { signup, login, authentication, uploadTo, restrictTo, refresh, logout };
