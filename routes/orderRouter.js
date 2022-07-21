const express = require('express')
const router = express.Router()
const {authenticateUser, authorizePermissions} = require('../middlware/authenticationMiddleware')

const{
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    updateOrder,
    createOrder
} = require('../controller/orderController')

router.route('/')
.get(authenticateUser, authorizePermissions('admin'),getAllOrders)
.post(authenticateUser,createOrder)

router.route('/showMyOrders').get(authenticateUser, getCurrentUserOrders)


router.route('/:id')
.get(authenticateUser, getSingleOrder)
.patch(authenticateUser,updateOrder)


module.exports = router