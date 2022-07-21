const User = require('../model/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../error')
const { createTokenUser, attachCookiesToResponse, checkPermission} = require('../util')
const mongoose = require('mongoose')

const getAllUsers = async(req,res)=>{

console.log(req.user)
    const users = await User.find({role:'user'}).select('-password')
    
    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req, res) => {
    
   

   const user = await User.findOne({_id:req.params.id}).select('-password')
    checkPermission(req.user, user._id)

   if(!user){
    throw new CustomError.NotFoundError('No user with such id')
   }

   res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async(req,res)=>{

    console.log('users roles in controller' , req.user.role)
    res.json({user:req.user})
}

const updateUser = async(req,res)=>{

    const {email, name} = req.body

    if(!email || !name){
        throw new CustomError.BadRequestError('Provide both email and name')
    }


    const user = await User.findOne({_id:req.user._id})
    user.email = email
    user.name = name

    await user.save()

        console.log(user, ' req user')


    const tokenUser = createTokenUser(user)

    attachCookiesToResponse({res,user:tokenUser})
    res.status(StatusCodes.OK).json({user:tokenUser})
}

const updateUserPassword = async(req,res)=>{

    const {oldPassword, newPassword} = req.body

    console.log('evo', req.user)

    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('Please provide old and new password')
    }

    if(!req.user._id){
        throw new CustomError.NotFoundError(`Can't find user info`)
    }

    const user = await User.findOne({_id:req.user._id})
    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if(!isPasswordCorrect){
        throw new CustomError.UnauthorizedError('Incorrect password provided')
    }

    user.password = newPassword
    await user.save()

    res.status(StatusCodes.OK).json({msg:'Password updated'})
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}