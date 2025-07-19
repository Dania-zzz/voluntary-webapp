const {Sequelize, Op, where } = require('sequelize');
const AppError = require('../utils/appError');

const searchVol = (req, res, next) => {
    const { gender, nationality, city, minAge, maxAge, martialStatus, eduLevel, eduMajor,
            laborSector, chronicDiseases, specialNeeds,
            email, firstName, lastName } = req.query; 
    const Volwhere = {};
    const today = new Date();
    // search my text
    if (email)
        Volwhere.email = { [Op.iLike]: `${email}%` }

    if (firstName)
        Volwhere.firstName = { [Op.iLike]: `%${firstName}%` }
    
    if (lastName)
        Volwhere.lastName = { [Op.iLike]: `%${lastName}%` }
    // -------
    if (gender)
        Volwhere.gender = { [Op.like]: `${gender}` }

    if (nationality)
        Volwhere.nationality = { [Op.like]: `%${nationality}%` }
    
    if (city)
        Volwhere.countryResidence = { [Op.like]: `%${city}%` }
    
    if (minAge) {
        const maxYear = today.getFullYear() - minAge - 1;
        Volwhere.birthDate = { [Op.lte]: new Date(maxYear, 11, 31) };
    }

    if (maxAge) {
        const minYear = today.getFullYear() - maxAge;
        Volwhere.birthDate = { [Op.gte]:new Date(minYear, 0, 1)  }; 
    }  

    if (minAge && maxAge) {
        if (minAge > maxAge) return next(new AppError('الحد الأدنى للعمر أكبر من الحد الأقصى', 400))
        const minYear = today.getFullYear() - minAge;
        const maxYear = today.getFullYear() - maxAge - 1;        
        Volwhere.birthDate = { [Op.between]: [new Date(maxYear, 0, 1), new Date(minYear, 11, 31)] }; 
    }

    if (martialStatus)
        Volwhere.martialStatus = { [Op.like]: martialStatus }
    
    if (eduLevel )
        Volwhere.eduLevel  = { level: {[Op.like]: `%${eduLevel}%` }}
    
    if (eduMajor)
        Volwhere.eduMajor = { [Op.like]: `%${eduMajor}%` }
    
    if (laborSector)
        Volwhere.laborSector  = { [Op.like]: laborSector }
    
    if (chronicDiseases)
        Volwhere.chronicDiseases = { [Op.eq]: chronicDiseases }
    
    if (specialNeeds)
        Volwhere.specialNeeds = { [Op.eq]: specialNeeds }

    return Volwhere;
}

const searchOpp = (req, res, next) => {
    const { city, category, participationType, urgency, minHours,
            maxHours, gender, eduLevel, eduMajor, interview, disabilities } = req.query;
    const Oppwhere = {};

    if (city)
        Oppwhere.city = { [Op.iLike]: `%${city}%` }

    if (category)
        Oppwhere.category = { [Op.like]: `${category}` }

    if (participationType)
        Oppwhere.participationType = { [Op.like]: `${participationType}` }

    if (urgency)
        Oppwhere.urgency = { [Op.eq]: `${urgency}` }

    if (minHours)
        Oppwhere.hours = { [Op.gte]: minHours }
    
    if (maxHours)
        Oppwhere.hours = { [Op.lte]: maxHours }

    if (minHours && maxHours){
        if (minHours > maxHours) return next(new AppError('الحد الأدنى للساعات أكبر من الحد الأقصى للساعات', 400))
        Oppwhere.hours = { [Op.between]: [minHours, maxHours] }
    }

    if (gender){
        if (gender.length === 2)
            Oppwhere.gender = { [Op.contains]: [gender] }
        else
        Oppwhere.gender = { [Op.eq]: [gender] }     
    }

    if (eduLevel )
        Oppwhere.eduLevel  = { level: {[Op.like]: `%${eduLevel}%` }}

    if (eduMajor)
        Oppwhere.eduMajor = { [Op.contains]: [eduMajor] }
    
    if (interview)
        Oppwhere.interview = { [Op.eq]: `${interview}` }
    
    if (disabilities)
        Oppwhere.disabilities = { [Op.eq]: `${disabilities}` }
    
    return Oppwhere;
}

module.exports = { searchVol, searchOpp };