const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Provider = require('../db/models/provider');
const Volunteer = require('../db/models/volunteer');
const Opportunity = require('../db/models/opportunity');

const getAllVolunteers = catchAsync(async (req, res, next) => {
    const result = await Volunteer.findAll();
    if (result.length === 0)
        return next(new AppError('لا يوجد متطوعين', 404));
    return res.status(201).json({
        status: 'success',
        data: result,
    })
});

const viewVolunteer  = catchAsync(async (req, res, next) => {
    const volID = req.params.volid;
    const result = await Volunteer.findByPk(volID);

    if (!result) return next(new AppError('المتطوع غير موجود', 400));

    return res.json({
        status: 'success',
        data: result
    });
});

// ------------------------------------------ provider
const getAllProviders = catchAsync(async (req, res, next) => {
    const result = await Provider.findAll();
    if (result.length === 0)
        return next(new AppError('لا يوجد أصحاب أعمال', 404));
    return res.status(201).json({
        status: 'success',
        data: result,
    })
});

const getPendingProviders = catchAsync(async (req, res, next) => {
    const result = await Provider.findAll( {where: { verified: 'Pending' }} )
    if (result.length === 0)
        return next(new AppError('لا يوجد طلبات التحقق من الحساب', 404));
    return res.status(201).json({
        status: 'success',
        data: result,
    })
});

const viewProvider  = catchAsync(async (req, res, next) => {
    const proID = req.params.proid;
    const result = await Provider.findOne({ where: { id: proID } });
    if (!result) return next(new AppError('حساب صاحب الأعمال غير موجود', 400));
    return res.json({
        status: 'success',
        data: result
    });
});

const verifyProvider  = catchAsync(async (req, res, next) => {
    const proID = req.params.proid;
    const decision = req.params.dcsn;
    const where = { id: proID }

    const pro = await Provider.findOne({ where });

    if (!pro) return next(new AppError('Invalid provider id', 400));
    if (pro.verified === 'Accepted') return next(new AppError('تم التحقق من الحساب مسبقا', 400)); 

    switch(decision){
        case 'acc':
            await Provider.update( { verified: 'Accepted' }, { where });
            break;

        case 'rej':
            await Provider.update( { verified: 'Rejected', deletedAt: new Date() }, { where });
            break;

        default: throw new AppError('قرار غير صالح', 400);
    }

    return res.json({
        status: 'success',
        msg: decision === 'acc' ? 'provider was verified' : 'provider was rejected'
    });
});

const getAllOpportunities = catchAsync(async (req, res, next) => {
    const result = await Opportunity.findAll();
    if (!result) return next(new AppError('حدث خطأ أثناء البحث عن الفرص', 400));

    if (result.length === 0)
        return next(new AppError('لا يوجد فرص', 404));
    return res.status(201).json({
        status: 'success',
        result,
    })
});

const getPendingOpps = catchAsync(async (req, res, next) => {
    const result = await Opportunity.findAll( {where: { reqStatus: 'Pending' }} );
    if (!result) return next(new AppError('حدث خطأ أثناء البحث عن الفرص', 400));
    
    if (result.length === 0)
        return next(new AppError('لا يوجد طلبات للتحقق من الفرصة', 404));
    
    return res.status(201).json({
        status: 'success',
        data: result,
    })
});

const viewOpportunity  = catchAsync(async (req, res, next) => {
    const oppID = req.params.oppid;
    const result = await Opportunity.findOne({
        where: { opportunityID: oppID },
        include: Provider
     });

    if (!result) return next(new AppError('الفرصة غير موجودة', 400));

    return res.json({
        status: 'success',
        data: result
    });
});

const verifyOpportunity  = catchAsync(async (req, res, next) => {
    const oppID = req.params.oppid;
    const decision = req.params.dcsn;
    const where = { opportunityID: oppID }

    const opp = await Opportunity.findOne({ where });

    if (!opp) return next(new AppError('معرف الفرصة غير صالح', 400));
    if (opp.reqStatus === 'Accepted') return next(new AppError('تم التحقق من الفرصة مسبقا', 400)); 

    switch(decision){
        case 'acc':
            await Opportunity.update( { reqStatus: 'Accepted' }, { where });
            break;
        case 'rej':
            await Opportunity.update( { reqStatus: 'Rejected', deletedAt: new Date() }, { where });
            break;
        default: throw new AppError('قرار غير صالح', 400);
    }


    return res.json({
        status: 'success',
        msg: decision === 'acc' ? 'opportunity was accepted' : 'opportunity was rejected'
    });
});


module.exports = { viewProvider, viewVolunteer, viewOpportunity, verifyProvider, verifyOpportunity,
    getAllVolunteers, getAllProviders, getPendingProviders, getAllOpportunities, getPendingOpps };