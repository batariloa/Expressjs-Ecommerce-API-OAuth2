const { default: mongoose } = require("mongoose");

const ReviewSchema = new mongoose.Schema({

rating:{
    type:Number,
    min:1,
    max:5,
    required:[true,'Please provide a rating']
},
title:{
    type:String,
    trim:true,
    required:[true,'Please provide a title'],
    maxlength:100,
},
comment:{
    type:String,
    required:[true,'Please provide a comment']
},
user:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:true,
},
product:{
    type:mongoose.Schema.ObjectId,
    ref:'Product',
    required:true,
}
}, {timestamps:true})

ReviewSchema.index({product:1, user:1}, {unique:true});

ReviewSchema.statics.calculateAverageRating = async function(productId){

const result = await this.aggregate([
    {$match:{product:productId}},
    {$group: {
        _id:null, 
        averageRating:{$avg:'$rating'},
        numOfReviews:{$sum: 1}
        }}
])

try{
await this.model('Product').findOneAndUpdate({_id:productId},{
    averageRating: Math.ceil(result[0]?.averageRating||0),
    numOfReviews: Math.ceil(result[0]?.numOfReviews||0),

})
}
catch(error){
    
}

console.log('aggregate', result)
}

ReviewSchema.post('save', async function(){

    await this.constructor.calculateAverageRating(this.product)
    console.log('post save hook called')
})

ReviewSchema.post('remove', async function(){
    await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)