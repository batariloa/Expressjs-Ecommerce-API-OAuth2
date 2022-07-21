const express = require('express')
const router = express.Router()
const {authenticateUser} = require('../middlware/authenticationMiddleware')

const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview
} = require('../controller/reviewController')

router.route('/')
.get(getAllReviews)
.post(authenticateUser,createReview)

router.route('/:id')
.delete(authenticateUser,deleteReview)
.get(getSingleReview)
.patch(authenticateUser,updateReview)

module.exports = router