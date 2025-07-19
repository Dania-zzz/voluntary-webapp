const Provider = require("../db/models/provider");
const Volunteer = require("../db/models/volunteer");
const Opportunity = require("../db/models/opportunity");
const Application = require("../db/models/application");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { searchOpp } = require("../utils/search");

const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { DateTime } = require("luxon");
const { Sequelize, Op } = require("sequelize");

const customStorage = (theUser, theField, orgFileName) => {
  if (!["1", "2"].includes(theUser))
    throw new AppError("نوع المستخدم غير صالح", 400);

  if (!["profilePicture", "authDoc", "cv"].includes(theField))
    throw new AppError("اسم الحقل غير صالح", 422);

  if (!orgFileName) throw new AppError("اسم الملف الأصلي مفقود", 400);

  let usertype = "";
  let destinationPath = "";

  if (theUser === "1") usertype = "provider";
  else if (theUser === "2") usertype = "volunteer";

  switch (theField) {
    case "profilePicture":
      destinationPath = `uploads/images/${usertype}/`;
      break;
    case "authDoc":
      destinationPath = "uploads/authDocs/";
      break;
    case "cv":
      destinationPath = `uploads/cvs/`;
      break;
    default:
      throw new AppError("اسم الحقل غير صالح", 400);
  }

  return `${destinationPath + orgFileName.split(".")[0]}-${
    Date.now() + path.extname(orgFileName)
  }`;
};

const bufferToFile = async (bufferData, filePath) => {
  const myBuffer = Buffer.from(bufferData, "utf-8");
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

const viewProfile = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError("User not authenticated", 401));
  }

  const userId = req.user.id;
  console.log(req.user);

  const result = await Volunteer.findByPk(userId, {
    attributes: [
      "profilePicture",
      "firstName",
      "lastName",
      "email",
      "voulnteerBio",
      "birthDate",
      "nationality",
      "countryResidence",
      "martialStatus",
      "gender",
      "chronicDiseases",
      "specialNeeds",
      "eduLevel",
      "eduMajor",
      "laborSector",
      "cv",
    ],
  });

  console.log(result);
  if (!result) return next(new AppError("معرف المستخدم غير صالح", 400));

  const profilePictureUrl = result.profilePicture
    ? `${req.protocol}://${req.get("host")}/${result.profilePicture}`
    : null;

  return res.json({
    status: "success",
    data: result,
    profilePicture: profilePictureUrl,
  });
});
const editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const body = req.body;

  const result = await Volunteer.findByPk(userId);
  if (!result) return next(new AppError("معرف المستخدم غير صالح", 400));

  let eduLevel;
  try {
    eduLevel = JSON.parse(req.body.eduLevel);
  } catch (error) {
    console.error("Failed to parse eduLevel:", error);
    return next(new AppError("Invalid eduLevel format", 400));
  }

  result.firstName = body.firstName;
  result.lastName = body.lastName;
  result.email = body.email;
  result.countryResidence = body.countryResidence;
  result.martialStatus = body.martialStatus;
  result.chronicDiseases = body.chronicDiseases;
  result.specialNeeds = body.specialNeeds;
  result.eduLevel = eduLevel;
  result.eduMajor = body.eduMajor;
  result.laborSector = body.laborSector;
  result.voulnteerBio = body.voulnteerBio;

  if (req.files?.cv) {
    const cvFile = req.files.cv[0];
    const cvPath = `uploads/cvs/cv-${Date.now()}-${cvFile.originalname}`;
    fs.writeFileSync(cvPath, cvFile.buffer);
    result.cv = cvPath;
  }

  if (req.files?.profilePicture) {
    const profilePictureFile = req.files.profilePicture[0];
    const profilePicturePath = `uploads/images/volunteer/profile-${Date.now()}-${
      profilePictureFile.originalname
    }`;
    fs.writeFileSync(profilePicturePath, profilePictureFile.buffer);
    result.profilePicture = profilePicturePath;
  }

  await result.save();

  return res.json({
    status: "success",
    data: result,
  });
});

const searchOpportunities = catchAsync(async (req, res, next) => {
  const where = searchOpp(req, res, next);

  where.reqStatus = "Accepted";

  const result = await Opportunity.findAll({
    where,
    include: [
      {
        model: Provider,
        attributes: ["profilePicture", "providerName", "providerBio"],
      },
    ],
  });

  if (result.length === 0) {
    return next(new AppError("لم يتم العثور على فرصة", 404));
  }

  return res.status(200).json({
    status: "success",
    data: result,
  });
});

const isOppActive = (opportunity) => {
  const deadline = new Date(opportunity.applyDeadline);
  const now = new Date();
  if (now > deadline) return { flag: false, msg: "لقد انقضى الموعد النهائي" };
  return { flag: true };
};

const isVolfit = (volunteer, opportunity) => {
  const age = getAge(volunteer.birthDate);
  const ageRange =
    age >= opportunity.ageRange[0].value &&
    age <= opportunity.ageRange[1].value;
  // ageRange
  if (!ageRange) {
    return { flag: false, msg: "لم تتجاوز شرط الفئة العمرية" };
  }
  // gender
  if (!opportunity.gender.includes(volunteer.gender)) {
    return { flag: false, msg: "لم تتجاوز شرط الجنس" };
  }
  // eduLevel
  if (!volunteer.eduLevel.points >= opportunity.eduLevel.points) {
    return { flag: false, msg: "لم تتجاوز شرط المستوى التعليمي" };
  }
  // eduMajor
  if (!opportunity.eduMajor.includes(volunteer.eduMajor)) {
    return { flag: false, msg: "لم تتجاوز شرط التخصص الأكاديمي" };
  }
  // disabilities
  if (
    !opportunity.disabilities &&
    (volunteer.chronicDiseases || volunteer.specialNeeds)
  ) {
    return { flag: false, msg: "لم تتجاوز شرط الصحة الجسدية/العقلية" };
  }
  return { flag: true };
};

const viewOpportunity = catchAsync(async (req, res, next) => {
  const opportunityID = req.params.oppid;
  const userId = req.user.id;

  const result = await Opportunity.findOne({
    where: {
      opportunityID,
      reqStatus: "Accepted",
    },
    include: Provider,
  });

  if (!result) return next(new AppError("معرف الفرصة غير صالح", 400));

  const vol = await Volunteer.findByPk(userId, {
    attributes: [
      "birthDate",
      "gender",
      "eduLevel",
      "eduMajor",
      "chronicDiseases",
      "specialNeeds",
    ],
  });

  const isApplied = Application.findOne({
    where: {
      voulnteerID: userId,
      opportunityID,
    },
  });

  let accessability = isOppActive(result);
  if (accessability.flag) accessability = isVolfit(vol, result);

  if (isApplied) accessability = { flag: false, msg: "لقد ارسلت طلبا بالفعل" };

  return res.json({
    status: "success",
    accessability: accessability,
    data: result,
  });
});

const applyforOpportunity = catchAsync(async (req, res, next) => {
  const volId = req.user.id;
  const oppId = req.params.oppid;
  let newApp = "";

  const myOpp = await Opportunity.findOne({
    where: { opportunityID: oppId, reqStatus: "Accepted" },
  });
  if (!myOpp) return next(new AppError("معرف الفرصة غير صالح", 400));

  newApp = await Application.create({
    voulnteerID: volId,
    opportunityID: oppId,
  });

  if (!newApp) return next(new AppError("فشل في إنشاء الطلب", 400));

  const result = newApp.toJSON();

  return res.status(201).json({
    status: "success",
    data: result,
  });
});

const viewApplications = catchAsync(async (req, res, next) => {
  const volID = req.user.id;

  const result = await Application.findAll({
    include: {
      model: Opportunity,
      attributes: ["opportunityName", "opportunityID"],
    },
    where: { voulnteerID: volID },
    attributes: ["status"],
  });

  if (result.length === 0)
    return next(new AppError("لا يوجد لديك تطبيقات لعرضها", 404));

  return res.json({
    status: "success",
    data: result,
  });
});

const cancelApplication = catchAsync(async (req, res, next) => {
  const volID = req.user.id;
  const oppID = req.params.oppid;

  const result = await Application.destroy({
    where: {
      opportunityID: oppID,
      voulnteerID: volID,
    },
  });

  if (!result) return next(new AppError("الطلب غير موجود", 400));

  return res.json({
    status: "success",
    data: "Application cancelled successfully",
  });
});

module.exports = {
  viewProfile,
  editProfile,
  searchOpportunities,
  viewOpportunity,
  applyforOpportunity,
  viewApplications,
  cancelApplication,
};
