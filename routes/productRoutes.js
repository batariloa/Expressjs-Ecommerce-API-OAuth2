const express = require('express')
const router = express.Router()

const {getAllProducts,
getSingleProduct,
updateProduct, 
deleteProduct, 
uploadImage,
createProduct}
= require('../controller/productController')
const { authenticateUser, authorizePermissions } = require('../middlware/authenticationMiddleware')

router.route('/')
.get(getAllProducts)
.post(authenticateUser,authorizePermissions('admin'),createProduct)

router.route('/:id')
.get(getSingleProduct)
.patch(authenticateUser,authorizePermissions('admin'),updateProduct)
.delete(authenticateUser,authorizePermissions('admin'),deleteProduct)

const {getSingleProductReviews}= require('../controller/reviewController')

router.route('/:id/reviews').get(getSingleProductReviews)

router.route('/uploadImage')
.post(authenticateUser,authorizePermissions('admin'),uploadImage)

module.exports = router