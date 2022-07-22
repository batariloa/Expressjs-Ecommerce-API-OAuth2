const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes')

const createJWT = (payload) =>{
    const token = jwt.sign({user:payload}, process.env.JWT_SECRET)

    return token
}

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET)


const attachCookiesToResponse = ({res, user, refreshToken}) =>{   

    const acessToken = createJWT(user);
    const oneDay = 1000*60*60*24
    const fiveSeconds = 1000 * 2

    res.cookie('accessToken', acessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed:true,
        maxAge:300000

    })

console.log('refreshtoken is ', refreshToken,)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed:true

    })
    
}

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse
}