const { default: mongoose } = require("mongoose");

const SingleCartItemSchema = new mongoose.Schema({
    name:{type:String, required:true},
    image:{type:String, required:true},
    price:{type:String, required:true},
    amount:{type:String, required:true},
    product:{
        type:mongoose.Schema.ObjectId,
        ref:'Product',
        required:[true,'Please provide product id']
    }
    
})

const OrderSchema = new mongoose.Schema({
    tax:{
        type:Number,

    },
    shippingFee:{
        type:Number,
        required:[true,'Please provide a shipping fee']
    },
    subtotal:{
        type:Number,
        required:[true,'Please provide a subtotal']
    },
    total:{
        type:Number,
        required:[true,'Please provide a total']
    },
    cartItems:[SingleCartItemSchema],
    status:{
        type:String,
        enum:['pending', 'failed', 'paid', 'delivered', 'canceled'],
        default: 'pending'
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Please provide items']
    },
    clientSecret:{
        type:String,
        required:true
    },
    paymentIntentId:{
        type:String
    }
}, {timestamps:true})


module.exports = mongoose.model('Order', OrderSchema)