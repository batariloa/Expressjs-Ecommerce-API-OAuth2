const CustomError = require('../error')
const {isTokenValid} = require('../util')


const authenticateUser = async(req,res,next) =>{

const token = req.signedCookies.refreshToken
if(!token){
    throw new CustomError.UnauthenticatedError('Invalid authentication')
}

try{
const {name, id,role} = isTokenValid({token})
console.log('podaci ', isTokenValid({token}))
req.user = {name:name, _id:id, role:role}

}
catch(error){
    throw new CustomError.UnauthenticatedError('Invalid authentication')
}

next()
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