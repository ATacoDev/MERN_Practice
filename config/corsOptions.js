const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => { // only origins in array can access backend REST API
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // !origin allows for postman and other things to access REST API
            callback(null, true) // success no error
        } else {
            callback(new Error('Not allowed by CORS')) // error
        }
    },
    credentials: true, 
    optionsSuccessStatus: 200
}

module.exports = corsOptions