const {createJWT, isTokenValid, attachCookiesToResponse} = require('./jwt')
const {createTokenUser} = require('./createTokenUser')
const checkPermission = require('./checkPermissions')
const sendVerificationEmail = require('./sendVerificationEmail')
module.exports = {
    createJWT, isTokenValid, attachCookiesToResponse, createTokenUser,checkPermission, sendVerificationEmail
}