const Provider = require('../db/models/provider');
const Volunteer = require('../db/models/volunteer');
const Opportunity = require('../db/models/opportunity')
const Application = require('../db/models/application')

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {searchVol} = require('../utils/search');

const multer = require('multer')
const fs = require('fs-extra')
const path = require('path')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { DateTime } = require('luxon');
const {Sequelize, Op, NUMBER } = require('sequelize');

const customStorage = (theUser, theField, orgFileName) =>
    {
        if (!['1', '2'].includes(theUser))
            throw new AppError('نوع مستخدم غير صالح', 400);
      
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


const viewProfile  = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    
    const result = await Provider.findByPk( userId,
         { attributes: ["profilePicture", "providerName", "email", "providerBio", "verified"] } );
    if (!result)
        return next(new AppError('معرف المستخدم غير صالح', 400));

    return res.json({
        status: 'success',
        data: result
    });
});

const editProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const body = req.body;

    const result = await Provider.findByPk(userId);
    if (!result)
        return next(new AppError('معرف المستخدم غير صالح', 400));

    const ppLocation = result.profilePicture;

    result.providerName = body.providerName;
    result.industry = body.industry;
    result.location = body.location;
    result.providerBio = body.providerBio;
    result.profilePicture = req.files.profilePicture ? customStorage('1', 'profilePicture', req.files.profilePicture[0].originalname) : result.profilePicture;
    await result.save();

    if (req.files.profilePicture){
        bufferToFile(req.files.profilePicture[0].buffer, result.profilePicture);
        fs.unlink(ppLocation, (err) => {
            if (err) return next(new AppError('فشل في حذف الصورة الشخصية القديمة', 400))
        });
    }
    
    return res.json({
        status: 'success',
        data: result,
    });    
});

function stringToBoolean(str) {
    try {
      return JSON.parse(str.toLowerCase());
    } catch (e) {
      return false;
    }
  }

const postOpportunity = catchAsync(async (req, res, next) => {
    const body = req.body;
    console.log(body)

    const userId = req.user.id;
    let newOpp = "";    
    

    // let ar =  [
    //     {
    //         "value": 18,
    //         "inclusive": true
    //     },
    //     {
    //         "value": 26,
    //         "inclusive": false
    //     }
    // ];

    try{
    newOpp = await Opportunity.create({
        providerID: userId,
        //basic info
        opportunityName: body.opportunityName,
        location: body.location,
        city: body.city,
        category: body.category,
        participationType: body.participationType,
        description: body.description,
        urgency: stringToBoolean(body.urgency),
        //coordinator info
        coordinatorName: body.coordinatorName,
        coordinatorPhoneNumber: body.coordinatorPhoneNumber,
        coordinatorEmail: body.coordinatorEmail,
        //time info
        applyDeadline: body.applyDeadline,
        // applyDeadline: "April 11, 2025",
        startDate: body.startDate,
        // startDate: "April 13, 2025",
        endDate: body.endDate,
        // endDate: "April 25, 2025",
        hours:  body.hours,
        capacity: body.capacity,
        //volunteer info
        ageRange: body.ageRange,
        gender: body.gender,
        eduLevel: body.eduLevel,
        eduMajor: body.eduMajor,
        skills: body.skills,
        volunteeringLevel: body.volunteeringLevel,
        volunteerSupport: body.volunteerSupport,
        benefits: body.benefits,
        tasks: body.tasks,
        interview: stringToBoolean(body.interview),
        // interview: false,
        disabilities: stringToBoolean(body.disabilities),
        // disabilities: false,
    });
}
catch(err){
    console.log(err + "=================")
    console.log(err.stack + "=================")
}
    
    // console.log("========================================")
    // console.log(newOpp)
    if (!newOpp) return next(new AppError('فشل في إنشاء الفرصة', 400));

    const result = newOpp.toJSON();
    
    return res.status(201).json({
        status: 'success',
        data: result,
    })
});

const editOpportunity = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const opportunityId = req.params.oppid;
    const body = req.body;

    const result = await Opportunity.findOne({
        where: { opportunityID: opportunityId, providerID: userId },
    });

    if (!result) {
        return next(new AppError('معرف الفرصة غير صالح', 400));
    }
        result.opportunityName = body.opportunityName,
        result.location = body.location,
        result.city = body.city,
        result.category = body.category,
        result.participationType = body.participationType,
        result.description = body.description,
        result.urgency = stringToBoolean(body.urgency),
        result.coordinatorName = body.coordinatorName,
        result.coordinatorPhoneNumber = body.coordinatorPhoneNumber,
        result.coordinatorEmail = body.coordinatorEmail,
        result.applyDeadline = body.applyDeadline,
        result.startDate = body.startDate,
        result.endDate = body.endDate,
        result.hours = body.hours,
        result.ageRange = body.ageRange,
        result.gender = body.gender,
        result.eduLevel = body.eduLevel,
        result.eduMajor = body.eduMajor,
        result.skills = body.skills,
        result.volunteeringLevel = body.volunteeringLevel,
        result.volunteerSupport = body.volunteerSupport,
        result.benefits = body.benefits,                      
        result.tasks = body.tasks,                      
        result.interview = stringToBoolean(body.interview),         
        result.disabilities = stringToBoolean(body.disabilities)
    const editResult = await result.save();

    return res.json({
        status: 'success',
        data: editResult,
    });    
})

const deleteOpportunity = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const opportunityId = req.params.oppid;

    const result = await Opportunity.findOne({
        where: { opportunityID: opportunityId, providerID: userId },
    });

    if (!result) {
        return next(new AppError('معرف الفرصة غير صالح', 400));
    }

    await result.destroy();

    return res.json({
        status: 'success',
        message: 'Opportunity deleted successfully',
    });    
})

const viewOpportunity  = catchAsync(async (req, res, next) => {
    const opportunityID = req.params.oppid;

    const result = await Opportunity.findByPk( opportunityID )
    if (!result)
        return next(new AppError('معرف الفرصة غير صالح', 400));

    return res.json({
        status: 'success',
        data: result
    });
});

// Dania modified
const getAllOpportunities = catchAsync(async (req, res, next) => {
    const provID = req.user.id;
    const result = await Opportunity.findAll({where: {providerID: provID}});
    if (result.length === 0)
        return next(new AppError('لا يوجد لديك فرص لعرضها', 404));
    return res.status(201).json({
        status: 'success',
        result,
    })
});

// Dania - NEW function
const countActiveOpportunities = catchAsync(async (req, res, next) => {
    const provID = req.user.id;
    const now = new Date();
    const result = await Opportunity.count({where: {
        providerID: provID,
        applyDeadline: {
            [Op.gt]: now
        }
    }});

    if (result.length === 0)
        return next(new AppError('لا يوجد لديك فرص لعرضها', 404));
    return res.status(201).json({
        status: 'success',
        result,
    })
});

const proAuth = catchAsync(async (req, res, next) => {
    const provID = req.user.id;
    const oppID = req.params.oppid;

    const opp = await Opportunity.findOne({
        where: { opportunityID: oppID }
    });
    if (!opp)
        return next(new AppError('معرف الفرصة غير صالح', 400));

    const result = await Opportunity.findOne({
        where: {
            opportunityID: oppID,
            providerID: provID
        }
    })

    if (!result) return next(new AppError("ليس لديك الإذن بتنفيذ هذا الإجراء", 403));
    return next();
})

const filterApplications = catchAsync(async (req, res, next) => {
    const where = searchVol(req, res, next);
    const result = await Volunteer.findAll({ where })   
    
    if (result.length === 0)
        return next(new AppError('لا يوجد لديك طلبات لعرضها', 404));
    
    return res.status(200).json({
        status: 'success',
        data: result,
    })
});

const getAllApplications = catchAsync(async (req, res, next) => {
    const oppID = req.params.oppid;
    const result = await Application.findAll({where: { opportunityID: oppID }, include: Volunteer
    });
    // if (result.length === 0)
    //     return next(new AppError('لا يوجد لديك طلبات لعرضها', 404));
    return res.status(201).json({
        status: 'success',
        result,
    })
});

// Dania - new
const getNewApplications = catchAsync(async (req, res, next) => {
    const result = await Application.findAll({ include: Volunteer });
    const countAll = await Application.count({
        distinct: true, // Count distinct values
        col: 'voulnteerID', // Count distinct voulnteerIDs
    });


    const countPending = await Application.count({where: { status: "Pending" }});
    return res.status(201).json({
        status: 'success',
        result,
        countAll, countPending
    })
});

const reviewApplication  = catchAsync(async (req, res, next) => {
    const oppID = req.params.oppid;
    const volID = req.params.volid;
    const decision = req.params.dcsn;
    const where = { opportunityID: oppID, voulnteerID: volID }

    const app = await Application.findOne({ where });
    if (!app)
        return next(new AppError('معرف الطلب غير صالح', 400));

    switch(decision){
        case 'Accepted':
            await Application.update( { status: 'Accepted' }, { where });
            break;
        case 'Rejected':
            await Application.update( { status: 'Rejected' }, { where });
            break;
        default: throw new AppError('قرار غير صالح', 400);
    }

    return res.json({
        status: 'success',
        msg: decision === 'Accepted' ? 'app Accepted' : 'app Rejected'
    });
});

module.exports = { viewProfile, editProfile,
    viewOpportunity, postOpportunity, editOpportunity, deleteOpportunity,
    getAllOpportunities, proAuth, getAllApplications, filterApplications, reviewApplication,
    countActiveOpportunities, getNewApplications
 };