const Product = require('../model/Product')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../error')
const { createTokenUser, attachCookiesToResponse, checkPermission} = require('../util')
const mongoose = require('mongoose')
const path = require('path')

const getAllProducts = async(req,res)=>{

    const products = await Product.find({})
    
    res.status(StatusCodes.OK).json({products})
}

const getSingleProduct = async(req,res)=>{

   const product = await Product.findOne({_id:req.params.id})

   
   if(!product){
    throw new CustomError.NotFoundError('No product with such id')
   }

   res.status(StatusCodes.OK).json({product})
}

const updateProduct = async(req,res)=>{

        const {id: productId} = req.params

    const product = Product.findOneAndUpdate({_id:productId}, req.body, {
        new:true,
        runValidators:true
    })

    if(!product){
    throw new CustomError.NotFoundError('No product with such id')
   }

   res.status(StatusCodes.OK).json({product})

}

const deleteProduct = async(req,res)=>{

    const {id: productId} = req.params

    const product = await Product.findOne({_id:productId}).exec();
    console.log('before error')

    if(!product){
    throw new CustomError.NotFoundError('No product with such id')
   }

    console.log('removing product....', product)
    await Product.remove(product)
    res.status(StatusCodes.OK).json({product})
}

const uploadImage = async(req,res)=>{

    if(!req.files){
        throw new CustomError.BadRequestError('No file provided')
    }

    const productImage = req.files.image
    if(!productImage.mimetype.startsWith('image')){

     throw new CustomError.BadRequestError('Not an image')
    }

    const maxSize = 1024*1024;

    if(productImage.size>maxSize){
     throw new CustomError.BadRequestError('Image must be less than 1mb in size')
    }

    const imagePath = path.join(__dirname,'../public/uploads/' + `${productImage.name}`)

    await productImage.mv(imagePath)
    res.status(StatusCodes.ACCEPTED).json({msg:`Image saved at ${imagePath}`})
}

const createProduct = async(req,res)=>{

    req.body.user = req.user._id
    const product = await Product.create(req.body)

    res.status(StatusCodes.CREATED).json(product)
}

module.exports = {
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    createProduct
}