const CustomError = require('../error')
const {isTokenValid, attachCookiesToResponse} = require('../util')
const Token = require('../model/Token')


const authenticateUser = async(req,res,next) =>{

const {refreshToken, accessToken} = req.signedCookies
console.log(' first, what the token ')

try{
console.log('access ', accessToken)

//in case access token is valid
if(accessToken){
    const payload = isTokenValid(accessToken)

    console.log('payload is ', payload)
    req.user = payload.user
    return next();
}

//in case access token is not valid

const payload = isTokenValid(refreshToken)

const existingToken = await Token.findOne({
    user:payload.user.id,
    refreshToken: payload.refreshToken
})

if(!existingToken || !existingToken?.isValid){
    throw new CustomError.UnauthenticatedError('Authentication invalid')
}

attachCookiesToResponse({res,user:payload.user})
req.user = payload.user

} catch(error){
    console.log('error ', error)
    throw new CustomError.UnauthenticatedError('Invalid authentication')
}


}

const authorizePermissions = (...roles) =>{

return (req,res,next)=>{

if(!roles.includes(req.user.role)){
    throw new CustomError.UnauthorizedError('No permission to access this route')
}

next();
}}
  

module.exports = {
    authenticateUser,
    authorizePermissions
}