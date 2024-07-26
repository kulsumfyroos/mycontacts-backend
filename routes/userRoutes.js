const express = require("express");
const {registerUser,
      loginUser, 
      currentUser, 
      resetPassword, 
      changePasswordRequest, 
      changePassword, 
      logoutUser, 
      renderDashboard, 
      renderContacts, 
      verifyOtp,
      registerUserWithOTP } = require("../controllers/userController");

const {createContact,
        deleteContact,
        editContact,
        updateContact} = require("../controllers/contactController");

const router = express.Router();
const bodyParser = require("body-parser");


const path = require("path");

const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: true })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"));

router.route("/").get((req,res) => {
  try{
    res.send('hi')
  }
  catch(err){
    res.send(err);
    }
});

router.route("/login").get((req,res) => {
    try{
      res.render('login.ejs')
    }
    catch(err){
      res.send(err);
      }
  });

router.route("/registerUserWithOTP").get((req,res) => {
  try{
    res.render('register.ejs')
  }
  catch(err){
    res.send(err);
    }
});

router.route("/dashboard")

router.route("/forgot").get((req, res) => {
  try{
    res.render('forgot.ejs');
  }
  catch(err){
    res.send(err);
  }
})

router.route("/resetPassword").get((req, res) => {
  try{
    res.render('resetPassword.ejs');
  }
  catch(err){
    res.send(err);
  }
})

router.route("/createContact").get((req, res) => {
  try{
    res.render('createContact.ejs');
  }
  catch(err){
    res.send(err);
  }
});

router.route("/verifyOtp").get((req, res) =>{
    const userEmail = req.query.email; // Get user's email from the query parameter
    // Render a page with a form to enter OTP
    res.render('verify-otp', { email: userEmail });
});

router.route("/logout").post(logoutUser);

router.route("/reset/:token").get(urlencodedParser,changePasswordRequest);

//router.route("/register").post(urlencodedParser,registerUser);

router.route("/login").post(urlencodedParser,loginUser);

router.route("/dashboard").get(renderDashboard);

router.route("/view-contact").get(urlencodedParser,renderContacts);

router.route("/createContact").post(urlencodedParser,createContact);

router.route("/forgot").post(urlencodedParser,resetPassword);

router.route("/deleteContact").post(urlencodedParser,deleteContact);

router.route("/edit/:id").get(urlencodedParser,editContact);
router.route("/edit/:id").post(urlencodedParser,updateContact);

router.route("/verifyOtp").post(urlencodedParser,verifyOtp);
router.route("/registerUserWithOTP").post(urlencodedParser,registerUserWithOTP)

router.route("/reset/:token").post(urlencodedParser,changePassword);



module.exports = router;