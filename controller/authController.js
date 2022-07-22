const User = require('../model/User')
const Token = require('../model/Token')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../error')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const path = require('path')

const origin = 'http://localhost:3000'

const {
createJWT, 
isTokenValid, 
attachCookiesToResponse, 
createTokenUser, 
sendVerificationEmail, 
sendResetPasswordEmail,
createHash
} =  require('../util')

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });


  const protocol = req.protocol
  const host = req.get('host')

    console.log(req)
  const forwardedHost = req.get('x-forwarded-host')
  const forwardedProtocol = req.get('x-forwarded-proto')

  const originHttp = req.get('origin')

  console.log({protocol, originHttp, host, forwardedHost, forwardedProtocol})

  await sendVerificationEmail({name:user.name, email:user.email, verificationToken:user.verificationToken, origin})
  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify account',
  });
}

const login= async (req,res)=>{

    const {email, password} = req.body

    if(!email || !password){
        throw new CustomError.BadRequestError('Please provide all credentials')
    }

    const user = await User.findOne({email})
    if(!user){
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }


    const isPasswordCorrect = await user.comparePassword(password)

    if(!isPasswordCorrect){
                throw new CustomError.UnauthenticatedError('Invalid Credentials')

    }
        const tokenUser = createTokenUser(user)
        //create refresh token

        let refreshToken = ''
        //check for existing token 

        const existingToken = await Token.findOne({user:user._id})

        if(existingToken){
          const {isValid} = existingToken

          if(!isValid){
            throw new CustomError.UnauthenticatedError('Invalid credentials')
          }

          refreshToken = existingToken.refreshToken

              
        attachCookiesToResponse({res, user:tokenUser, refreshToken})
        res.json({refreshToken})
        return; 
        }

        refreshToken = crypto.randomBytes(40).toString('hex')
        const userAgent = req.headers['user-agent']
        const ip = req.ip

        console.log('user is ', user)
        console.log('checking values', refreshToken, ' ', ip, ' ', userAgent)
        console.log('refresh token', refreshToken)
        const userToken = {refreshToken, ip, userAgent, user:user._id}

        const token = await Token.create(userToken)

    
        attachCookiesToResponse({res, user:tokenUser, refreshToken})


    res.json({refreshToken})
}

const logout = async (req,res)=>{


//delete token
await Token.findOneAndDelete({user:req.user.id})

//delete cookies
        res.cookie('accessToken', 'logout', {
            httpOnly:true,
            expires: new Date(Date.now())
        })
        res.cookie('refreshToken', 'logout', {
            httpOnly:true,
            expires: new Date(Date.now())
        })
        res.status(StatusCodes.OK).json({msg:'user logged out'})

}

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
}

const forgotPassword = async (req, res) => {

  const {email} = req.body

  if(!email){
    throw new CustomError.BadRequestError('Please provide valid email')
  }

const user = await User.findOne({email})

if(user){
  const passwordToken = crypto.randomBytes(70).toString('hex')

  await sendResetPasswordEmail({name:user.name, email:user.email, token:passwordToken, origin})

  const tenMinutes = 1000 * 60 * 10
  const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)

  user.passwordToken = createHash(passwordToken)
  user.passwordTokenExpirationDate = passwordTokenExpirationDate
  await user.save()
}
  
//send success message regardless
  res.status(StatusCodes.OK).json({ msg: 'Please check your email for reset password link' });
};

const resetPassword = async (req, res) => {

  const {token,email,password} = req.body

  if(!token || !email || !password){
        throw new CustomError.BadRequestError('Please provide all values')
  }

  const user = await User.findOne({email})

  if(user){
  const currentDate = new Date()

  if(user.passwordToken === createHash(token) 
  && user.passwordTokenExpirationDate>currentDate){
  user.password = password
  user.passwordToken = null
  user.passwordTokenExpirationDate = null
  await user.save()
  }

  }

  //send OK status either way
  res.status(StatusCodes.OK).json({ msg: 'Password reset' });
};





module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword
}