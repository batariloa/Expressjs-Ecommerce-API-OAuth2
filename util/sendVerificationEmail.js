const sendEmail = require('./sendEmail')


const sendVerificationEmail = async ({name,email,verificationToken,origin})=>{

const verifyEmailLink = `${origin}/user/verify-email?token=${verificationToken}` //has to be made on frontend
const msg = `<p>Please confirm your email by clicking on the following link: <a href='${verifyEmailLink}'>Verify email</a> </p>`

return sendEmail({to:email, 
subject:`Email confirmation`, 
html:`<h3>Hello, ${name}</h3>
${msg}`}
)
}

module.exports = sendVerificationEmail