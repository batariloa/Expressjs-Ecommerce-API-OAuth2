const express = require('express')
const app = express()

//other
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

//security 
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimiter = require('express-rate-limit')

//security implementation
app.set('trust proxy', 1) 
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, //15 min
    max: 60
}))
app.use(cors())
app.use(mongoSanitize())
app.use(xss())

require('dotenv').config()
require('express-async-errors')

//common    
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))
app.use(fileUpload())



//db
const connectDB = require('./db/connect')

//routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRouter')

//routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)



//middleware
const notFoundMiddleware = require('./middlware/not-found')
const errorHandlerMiddleware= require('./middlware/error-handler')
app.use(notFoundMiddleware) 
app.use(errorHandlerMiddleware) // has to be the last one, launched from actual existing controller



const port = process.env.PORT
const start = async ()=>{
    try{    
        console.log('blop', process.env.MONGO_URI)

        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log('Listening on port', port, '...'))
    }
    catch(error){

    }
}

start()