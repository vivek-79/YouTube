

import mongoose from 'mongoose'
import { DB_NAME } from '../Constants.js'

const connectDB = async()=>{
    try {
        const connection = mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB CONNECTED AT HOST :${connection.Connection}`)
    } catch (error) {
        console.log("ERROR IN DB CONNECT",error)
    }
}

export default connectDB