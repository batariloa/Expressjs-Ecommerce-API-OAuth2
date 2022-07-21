const {StatusCodes} = require('http-status-codes')
const CustomError = require('../error')
const {checkPermission} = require('../util')
const mongoose = require('mongoose')
const Product = require('../model/Product')
const Review = require('../model/Review')


const createReview = async(req,res)=>{

    const {product:productId} = req.body

    //check if product exists
    const product = await Product.findOne({_id:productId})
    if(!product){
        throw new CustomError.NotFoundError('No such product')
    }
    console.log('here is user', req.user)
    //check if user already submitted a review
    const alreadySubmitted = await Review.findOne({
        product:productId,
        user:req.user._id
    })
    if(alreadySubmitted){
        throw new CustomError.BadRequestError('Already submitted a review for this product')
    }

    req.body.user = req.user._id
    
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

const getAllReviews = async(req,res)=>{


    const reviews = await Review.find({})
    .populate({
        path:'product',
        select:'name company price'
        })

    res.status(StatusCodes.OK).json({reviews:reviews, count:reviews.length})
}

const getSingleReview = async(req,res)=>{

    const {id:productId} = req.params

    const review = await Review.findOne({_id:productId})

    if(!review){
        throw new CustomError.NotFoundError('No review with such id')
    }

    res.status(StatusCodes.OK).json({review:review})
}

const getSingleProductReviews = async(req,res)=>{
    const {id:productId} = req.params

    const reviews = await Review.find({product:productId})

    res.status(StatusCodes.OK).json({reviews})
}

const updateReview = async(req,res)=>{
    
    const {id:productId} = req.params
    const review = await Review.findOne({_id:productId})

    const {rating, title, comment} = req.body;
    console.log('request rating is', rating)
    console.log('but review rating is', review)
    review.rating = rating;
    review.title = title;
    review.comment = comment

    checkPermission(req.user, review.user)

    await review.save()
    
    res.status(StatusCodes.OK).json({review:review})

}

const deleteReview= async(req,res)=>{

    const {id:productId} = req.params
    const review = await Review.findOne({_id:productId})

    if(!review){
        throw new CustomError.NotFoundError('No review with such id')
    }
    console.log('heres the review', review)
    checkPermission(req.user, review.user)

    await Review.remove(review)
    
    res.status(StatusCodes.OK).json({review:review})

}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
}