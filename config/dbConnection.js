const mongoose = require("mongoose");

const connectDb = async () =>{
    console.log('helloooo')
    try{
        console.log(process.env.CONNECTION_STRING)
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database Connected: ", connect.connection.host, connect.connection.name)
    }
    catch(err){
        console.log(CONNECTION_STRING)
        console.log(err);
        process.exit();
    }
};

module.exports = connectDb;
