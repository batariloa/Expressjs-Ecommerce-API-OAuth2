const User = require('../model/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../error')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const {createJWT, isTokenValid, attachCookiesToResponse, createTokenUser, sendVerificationEmail} =  require('../util')
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

  const origin = req.get('origin')

  console.log({protocol, origin, host, forwardedHost, forwardedProtocol})

  await sendVerificationEmail({name:user.name, email:user.email, verificationToken:user.verificationToken, origin})
  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify account',
  });
};
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
        const userInfo = createTokenUser(user)
        attachCookiesToResponse({res, user:userInfo})


    res.send('Test')
}
const logout = async (req,res)=>{

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
};



module.exports = {
    register,
    login,
    logout,
    verifyEmail
}