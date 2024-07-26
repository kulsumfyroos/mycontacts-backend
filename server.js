const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const session = require('express-session')
const passport = require('passport');
const port  = process.env.PORT || 5000;
const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));


app.use(passport.initialize());
app.use(passport.session());

connectDb();

app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

app.use(express.json());

app.use(express.static("public"));

app.use("/",require("./routes/userRoutes.js"));

app.use("/users",require("./routes/userRoutes.js"));

//app.use("/login",require("./routes/userRoutes.js"));

app.use('/forgot',require("./routes/userRoutes.js"));

app.use('/resetPassword',require("./routes/userRoutes.js"));

app.use('/reset/:token',require("./routes/userRoutes.js")); 

app.use('/reset/:token',require("./routes/userRoutes.js"));

app.use('/logout',require("./routes/userRoutes.js"));

app.use('/dashboard',require("./routes/userRoutes.js"));

app.use('/view-contact',require("./routes/userRoutes.js"));

app.use('/createContact',require("./routes/userRoutes.js"));

app.use('/edit/:id',require("./routes/userRoutes.js"));

app.use('/deleteContact',require("./routes/userRoutes.js"));

app.use('/verifyOtp',require("./routes/userRoutes.js"));
app.use('/registerUserWithOTP',require("./routes/userRoutes.js"));

app.use(errorHandler);

app.listen(port, ()=>{
    console.log(`The server is running on port ${port}`)
});