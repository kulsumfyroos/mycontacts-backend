const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    // You can keep the username field or remove it, depending on your requirements.
    username: String,
    email: {
        type: String,
        required: [true, "Please add the user email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please add the user password"],
    },
    otp: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true,
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' }); // Specify 'email' as the usernameField

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// passport.serializeUser((user, done) => {
//     done(null, user.id);
//   });
  
//   passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => {
//       done(err, user);
//     });
//   });
  

module.exports = User;