const { authentication, restrictTo, uploadTo} = require('../controller/authController');
const { viewProfile, editProfile, viewOpportunity, postOpportunity, editOpportunity, deleteOpportunity,
    getAllOpportunities, proAuth, filterApplications, getAllApplications, reviewApplication,
    countActiveOpportunities, getNewApplications
 } = require('../controller/providerController');

const router = require('express').Router();

router
    .route('/profile')
    .get(authentication, restrictTo('provider'), viewProfile)
    .patch(authentication, restrictTo('provider'), uploadTo(), editProfile);


router
    .route('/opp')
    .post(authentication, restrictTo('provider'), postOpportunity)
    .get(authentication, restrictTo('provider'), getAllOpportunities)

router
    .route('/opp/:oppid')
    .get(authentication, restrictTo('provider'), viewOpportunity)
    .patch(authentication, restrictTo('provider'), editOpportunity)
    .delete(authentication, restrictTo('provider'), deleteOpportunity)


router.route('/:oppid/apps/search').get(authentication, restrictTo('provider'), proAuth, filterApplications)
router.route('/:oppid/apps').get(authentication, restrictTo('provider'), proAuth, getAllApplications);
router.route('/opp/:oppid/:volid/:dcsn').put(authentication, restrictTo('provider'), proAuth, reviewApplication);

// Dania - counters
router.route('/count/activeOpps').get(authentication, restrictTo('provider'), countActiveOpportunities)
router.route('/count/newApps').get(authentication, restrictTo('provider'), getNewApplications)
module.exports = router;