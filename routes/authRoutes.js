const express = require('express')
const router = express.Router()

const {login, logout, register, verifyEmail} = require('../controller/authController')

router.route('/login').post(login)
router.route('/register').post(register)
router.route('/logout').get(logout)
router.route('/').get(logout)
router.route('/verify-email').post(verifyEmail);


module.exports = router