const { authentication, restrictTo, uploadTo } = require('../controller/authController');
    
const { viewProfile, editProfile, searchOpportunities, viewOpportunity,
        applyforOpportunity, viewApplications, cancelApplication } = require('../controller/volunteerController');

const router = require('express').Router();

router
    .route('/profile')
    .get(authentication, restrictTo('volunteer'), viewProfile)
    .patch(authentication, restrictTo('volunteer'), uploadTo(), editProfile);

router.route('/opp/search').get(authentication, restrictTo('volunteer'), searchOpportunities);

router
    .route('/opp/:oppid')
    .get(authentication, restrictTo('volunteer'), viewOpportunity)
    .post(authentication, restrictTo('volunteer'), applyforOpportunity)
    .delete(authentication, restrictTo('volunteer'), cancelApplication)

router.route('/apps').get(authentication, restrictTo('volunteer'), viewApplications)

module.exports = router;