const router = require('express').Router()
const Controller = require('../controllers/Auth.controller')


router.post('/login',Controller.login);

router.post('/sendrecoveryemail',Controller.sendRecoveryEmail);

router.post('/recoverpassword',Controller.recoverPassword);
module.exports = router