const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
    name: {
        type:String, 
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 100
        },
    email: {
        type:String, 
        required: [true, 'Please provide email'],
        validate:{
            validator: validator.isEmail,
            message: 'Please provide a valid email',
        },
        unique:true
        },
    password: {
        type:String, 
        required: [true, 'Please provide email'],
        minlength:6
        },
    role:{
        type:String,
        enum:['admin','user'],
        default: 'user'
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verified: {
        type:Date
    },
    verificationToken:{
        type:String,
        required:true
    },
    passwordToken:{
        type:String
    },
    passwordTokenExpirationDate:{
        type:Date
    }
})

UserSchema.pre('save', async function(){

    if(!this.isModified('password')) return;
    console.log('hey')
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)