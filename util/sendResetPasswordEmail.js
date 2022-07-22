const sendEmail = require('./sendEmail')


const sendResetPasswordEmail = async({name, email, token, origin})=>{

    const resetLink = `${origin}/user/reset-password?email=${email}&token=${token}`
    const message = `<p>Please reset password by clicking on the following link: 
    <a href="${resetLink}">Reset password</a></p>`   

return sendEmail({
    to:email,
    subject:'Reset password',
    html:`<h4>Hello ${name}, ${message}</h4>`
})
}

module.exports = sendResetPasswordEmail