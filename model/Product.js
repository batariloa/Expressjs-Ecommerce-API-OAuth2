const { default: mongoose } = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,'Please provide product name'],
        maxlength: [100, `Name size can't exceed 100 characters`],
    },
    price:{
        type:Number,
        required:[true,'Please provide product price'],
        default:0
    },
    description:{
        type:String,
        required:[true,'Please provide product description'],
        default: 0,
        maxlength: [1000, `Description size can't exceed 1000 characters`],
    },
    image:{
        type: String,
        default:'https://www.suzukijember.com/gallery/gambar_product/default.jpg',
    },
    category:{
        type:String,
        required:[true,'Please provide product category'],
        enum:['office','kitchen','bedroom']
    },
    company:{
        type:String,
        required:[true,'Please provide product company'],
        enum:{
            values:['ikea', 'liddy', 'marcos'],
            message:'{VALUE} is not a valid company name'
        }
    },
    colors:{
        type:[String],
        required:[true,'Please provide product color'],
        default:['white']
    },
    featured:{
        type:Boolean,
        required:true,
        default: false
    },
    freeShipping:{
        type:Boolean,
        required:true,
        default: false
    },    
    inventory:{
        type:Number,
        required:true,
        default: 1
    },   
    averageRating:{
        type:Number,
        default:0
    },
    numOfreviews:{
        type:Number,
        default:0
    },
    user:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
}, {timestamps:true, 
    toJSON:{virtuals: true}, 
    toObject:{virtuals:true}})

ProductSchema.virtual('reviews', {
    ref:'Review',
    localField:'_id',
    foreignField:'product',
    justOne:false
})

ProductSchema.pre('remove', async function(next) {
  
  console.log('HELL YAh')

  await this.model('Review').find({product: this._id}).remove(function(err){console.log(err)})
  next()
})


module.exports = mongoose.model('Product', ProductSchema)