const express = require('express')
const router = express.Router()


const {authenticateUser} = require('../middlware/authenticationMiddleware')
const {login, logout, register, verifyEmail,
forgotPassword, resetPassword} = require('../controller/authController')

router.route('/login').post(login)
router.route('/register').post(register)
router.route('/logout').delete(authenticateUser,logout)
router.route('/').get(logout)
router.route('/verify-email').post(verifyEmail);
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password').post(resetPassword)


module.exports = router