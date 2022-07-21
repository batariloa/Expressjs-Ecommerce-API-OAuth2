const CustomError = require('../error')

const checkPermission = (requestUser, resourceUserId) =>{

    if(requestUser.role === 'admin') return;
    if(requestUser._id === resourceUserId.toString()) return;

    throw new CustomError.UnauthenticatedError('No permission')
}

module.exports = checkPermission