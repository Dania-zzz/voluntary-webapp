const {authentication, restrictTo} = require('../controller/authController');
const { viewProvider, viewVolunteer, viewOpportunity, verifyProvider, verifyOpportunity,
    getAllVolunteers, getAllProviders, getPendingProviders, getAllOpportunities, getPendingOpps
} = require('../controller/adminController');

const router = require('express').Router();

// provider
router.route('/provider').get(authentication, restrictTo('admin'), getAllProviders);
router.route('/verify/provider').get(authentication, restrictTo('admin'), getPendingProviders);
router.route('/verify/provider/:proid').get(authentication, restrictTo('admin'), viewProvider);
router.route('/verify/provider/:proid/:dcsn').put(authentication, restrictTo('admin'), verifyProvider);
// opportunity
// router.route('/opportunity').get(authentication, restrictTo('admin'), getAllOpportunities);
router.route('/opportunity').get(getAllOpportunities);
router.route('/verify/opportunity').get(authentication, restrictTo('admin'), getPendingOpps);
router.route('/verify/opportunity/:oppid').get(authentication, restrictTo('admin'), viewOpportunity);
router.route('/verify/opportunity/:oppid/:dcsn').put(authentication, restrictTo('admin'), verifyOpportunity);
// volunteer
router.route('/volunteer').get(authentication, restrictTo('admin'), getAllVolunteers);
router.route('/verify/volunteer/:volid').get(authentication, restrictTo('admin'), viewVolunteer);

module.exports = router;