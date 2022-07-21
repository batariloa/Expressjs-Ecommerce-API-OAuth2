const {StatusCodes} = require('http-status-codes')
const CustomError = require('../error')
const { createTokenUser, attachCookiesToResponse, checkPermission} = require('../util')
const mongoose = require('mongoose')
const path = require('path')

const Order = require('../model/Order')
const Product = require('../model/Product')

const getAllOrders = async(req,res) =>{

    const orders = await Order.find({})

    res.status(StatusCodes.OK).json({orders:orders, count:orders.length})


}

const getCurrentUserOrders = async (req, res) => {
    

    console.log('current user id is ', req.user._id)
    const orders = await Order.find({user:req.user._id})
    res.status(StatusCodes.OK).json({ orders: orders })

}

const getSingleOrder = async (req, res) => {
    
    console.log('whaaat')
    console.log('heres the user', req.user)

    const { id: orderId } = req.params
    
    const order = await Order.findOne({ _id: orderId })
    if (!order) {
        throw new CustomError.NotFoundError('No order with such id')
    }

    checkPermission(req.user, orderId)

    res.status(StatusCodes.OK).json({ order: order })
}


const fakeStripeAPI = async({amount, currency})=>{

    const client_secret = 'SomeRandomValue'

    return {client_secret, amount}
}
const createOrder = async(req,res) =>{

    const {items:cartItems, tax, shippingFee} = req.body

    if(!cartItems || cartItems.length<1){
        throw new CustomError.BadRequestError('No cart items provided')
    }

    if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('Please provide shipping and tax fees')
    }

    let orderItems = [];
    let subtotal = 0;

    console.log('items are currently', cartItems)

    for(const item of cartItems){
        console.log(' and the product id is', item.product)
        const dbProduct = await Product.findOne({_id:item.product})
        if(!dbProduct){
            throw new CustomError.NotFoundError('No such product')
        }

        const {name, price,image, _id} = dbProduct
        console.log(name, price, image)
        
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product:_id
        }

    orderItems = [...orderItems, singleOrderItem]
    subtotal += item.amount * price

    }
    

    const total = subtotal + tax + shippingFee;
    //get client secret
    const paymentIntent = await fakeStripeAPI({
        amount:total,
        currency: 'usd'
    })

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user._id
    })

    

    res.status(StatusCodes.CREATED).json(order)

}

const updateOrder = async(req,res) =>{
   
    const { id: orderId } = req.params
    
    const {paymentIntentId} = req.body

    const order = await Order.findOne({ _id: orderId })
    if (!order) {
        throw new CustomError.NotFoundError('No order with such id')
    }

    checkPermission(req.user, orderId)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'

    await order.save()
    
    res.status(StatusCodes.OK).json({ order: order })

}

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    updateOrder,
    createOrder

}