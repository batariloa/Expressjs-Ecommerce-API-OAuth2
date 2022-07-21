const createTokenUser = (user)=>{

   return {id:user._id, name:user.name, role:user.role}   
}

module.exports = {createTokenUser}