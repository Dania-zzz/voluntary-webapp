const { signup, login, uploadTo, authentication, restrictTo, refresh,
     logout} = require('../controller/authController');
const router = require('express').Router();

router.route('/signup/:userType').post(uploadTo(), signup);
router.route('/login/:userType').post(login);
router.route('/refresh').post(refresh);
router.route('/logout').post(logout);

module.exports = router;