const express = require('express')
const router = express.Router()
const {authenticateUser, authorizePermissions} = require('../middlware/authenticationMiddleware')
const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require('../controller/userController')

router.route('/').get(
    authenticateUser,
    authorizePermissions('admin'),
    getAllUsers)

router.route('/showMe').get(authenticateUser,showCurrentUser)
router.route('/updateUser').patch(authenticateUser,updateUser)
router.route('/updateUserPassword').post(authenticateUser,updateUserPassword)
router.route('/:id').get(authenticateUser,authorizePermissions('admin','user'),getSingleUser)

module.exports = router