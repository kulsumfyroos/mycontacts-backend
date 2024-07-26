const asyncHandler = require("express-async-handler");
const async = require('async');
const User = require("../models/userModel");
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config();
const session = require('express-session');
const Contact = require("../models/contactModel");



const renderDashboard = asyncHandler(async (req, res) => {
   if(req.session.loggedIn){
    res.render('dashboard.ejs');
   }
    else{
      res.redirect('/login');
    }
});

const logoutUser = asyncHandler(async (req, res) => {
  req.logOut(function(err) {
    if (err) { return next(err); }
    req.session.loggedIn = false; 
    res.redirect('/login'); 
  });
});

// const registerUser = asyncHandler(async (req, res) => {
//     const newUser = new User({ username: req.body.username, email: req.body.email, password: req.body.password});
//     User.register(newUser, req.body.password, (err, user) => {
//         if (err) {
//             console.log(err);
//             return res.status(400).json({ message: 'Registration failed' });
//         }
//         passport.authenticate('local')(req, res, () => {
//             res.send("registration successful")
//         });
//     });   
// });

// Declare an object to store temporary user data
const tempUserData = {};

const registerUserWithOTP = asyncHandler(async (req, res) => {
  // Generate OTP
  const otp = generateOTP();

  // Create a temporary user object with the provided data and store the OTP
  tempUserData[req.body.email] = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    otp: otp,
  };

  try {
    // Send OTP to user via email
    await sendOTPEmail(req.body.email, otp);

    // Redirect to a page where users enter the received OTP
    res.render('otpReg.ejs', { email: req.body.email });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Registration failed' });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const userEmail = req.body.email;
  const enteredOTP = req.body.otp;

  try {
    // Retrieve temporary user data from the object
    const tempUser = tempUserData[userEmail];

    // Check if tempUser exists
    if (tempUser) {
      // Verify the entered OTP with the stored OTP in the temporary user object
      if (enteredOTP === tempUser.otp) {
        const newUser = new User({
          username: tempUser.username,
          email: tempUser.email,
          password: tempUser.password,
        });

        // Register the new user
        User.register(newUser, newUser.password, async (err, user) => {
          if (err) {
            console.error(err);
            return res.status(400).json({ message: 'Registration failed' });
          }

          // Clear the temporary user data after successful registration
          delete tempUserData[userEmail];

          // Authenticate the user
          req.login(user, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Internal Server Error");
            }

            return res.send("Registration successful");
          });
        });
      } else {
        // Invalid OTP, show an error message
        res.status(400).json({ message: 'Invalid OTP. Please try again.' });
      }
    } else {
      // User with the same username already exists
      res.status(400).json({ message: 'Username is already taken. Please choose another.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTPEmail(email, otp) {
  console.log(`Sending OTP ${otp} to ${email}`);
  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.MYEMAIL,
      pass: process.env.APP_PASSWORD, 
    }
  });

  // Define the email options
  const mailOptions = {
    from: process.env.MYEMAIL, // Replace with your email
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; // You might want to handle this error in your application
  }
};






const loginUser = asyncHandler(async (req, res) => {
  passport.authenticate('local', (err, user, info) => {
    try {
      
      if (err) {
        console.error(err);
        return res.redirect('/login'); // Handle the error appropriately
      }

      if (!user) {
        console.log('Invalid username or password');
        return res.redirect('/login'); // User not found or incorrect password
      }

      req.login(user, (err) => {
        if (err) {
          console.error(err);
          return res.redirect('/login'); // Handle the error appropriately
        }

        req.session.loggedIn = true;
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error(error);
      res.redirect('/login');
    }
  })(req, res);
});




const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

const resetPassword = asyncHandler(async (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
              if (err) {
                return done(err);
              }
              var token = buf.toString('hex');
              done(null, token);
              console.log(token);
            });
      },
      async function findUserAndUpdateToken(token) {
          const user = await User.findOne({ email: req.body.email });
          if (!user) {
            console.log('error', 'No account with that email address exists.');
            return res.redirect('/users/forgot');
          }
          user.resetPasswordToken = token;
          console.log(user.resetPasswordToken);
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          console.log(user);
          console.log(user.email);
          try {
            console.log("saving..")
            await user.save();
            console.log('User saved successfully.');
            return user;
          } catch (error) {
            console.error('Error while saving user:', error);
          }
          callback(null, user);   
      },
      function(user, callback) {
        var smtpTrans = nodemailer.createTransport({
           service: 'Gmail', 
           auth: {
            user: process.env.MYEMAIL,
            pass: process.env.APP_PASSWORD,
          }
        });
        
          smtpTrans.sendMail({
            to: user.email,
            from: process.env.MYEMAIL,
            subject: 'ContactManagerWebApp',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + user.resetPasswordToken + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          });
          console.log("Mail sent successfully");
          res.send("check your mail id for the password reset link");
  }
    ], function(err) {
      console.log('this err' + ' ' + err)
      res.redirect('/');
    });
  });

const changePasswordRequest = asyncHandler(async (req, res) => {
  const requestToken = req.params.token;
  const user = await User.findOne({ resetPasswordToken: requestToken, resetPasswordExpires: { $gt: Date.now() }});
  console.log(user);
  if (user) {
    res.render('resetPassword.ejs',{ requestToken });
  } else {
    res.status(400).send('Invalid or expired token');
  }
});

const changePassword = asyncHandler(async (req, res) => {
  async.waterfall([
    async function(callback) {
      const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
      if (!user) {
        // Handle the case when the user doesn't exist or the token has expired
        return res.status(400).send('Password reset token is invalid or has expired.');
      }

      // Set the new password
      user.password = req.body.password;
      //user.resetPasswordToken = undefined;
      //user.resetPasswordExpires = undefined;

      // Save the user with the new password
      try {
        console.log("saving..")
        await user.save();
        console.log('User saved successfully.');
        return user;
      } catch (error) {
        console.error('Error while saving user:', error);
      }
      
      // Send a confirmation email
      console.log(user);
      callback(null, user);
    },
    function(user, callback) {
      console.log(user);
      var smtpTrans = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.MYEMAIL,
          pass: process.env.APP_PASSWORD,
        }
      });

      var mailOptions = {
        to: user.email,
        from: process.env.MYEMAIL,
        subject: 'ContactManagerWebApp',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };

      smtpTrans.sendMail(mailOptions, function(err) {
        if (err) {
          console.log('Email sending error:', err);
        } else {
          console.log('Success! Your password has been changed.');
          res.send('Password changed.Please return to login page for login');
        }
      });
    }
  ], function(err) {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred during the password change process.');
    }
  });
});

const renderContacts = asyncHandler(async (req, res) => {
  try {
    const user = req.user; // Assuming user is authenticated
    const contacts = await Contact.find({userid: req.user._id});;

    res.render('viewContacts.ejs', { user, contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



module.exports = {
                  //registerUser,
                  loginUser, 
                  currentUser, 
                  resetPassword, 
                  changePasswordRequest, 
                  changePassword, 
                  logoutUser, 
                  renderDashboard ,
                  renderContacts,
                  registerUserWithOTP,
                  verifyOtp
                };