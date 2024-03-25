const jwt = require('jsonwebtoken')
require('dotenv').config()

const secretKey = process.env.SECRET_KEY;

exports.generateTokenUser = (user) => {
    return jwt.sign({id: user.id}, secretKey, {expiresIn: '1d'})
}