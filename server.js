require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const ObjectId = require('mongodb').ObjectId;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");



const app = express();


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: "our secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.mongourl, { useNewUrlparser: true });
// userDB", { useNewUrlparser: true });


// mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlparser: true });
// mongodb+srv://admin-rahul:@cluster0.nv2ihbl.mongodb.net/?retryWrites=true&w=majority
// mongodb+srv://<username>:<password>@cluster0.q6yoqjl.mongodb.net/?retryWrites=true&w=majority

// mongoose.set("useCreateIndex",true);
const userSchema = new mongoose.Schema({
    lastupdate: Date,
    firstname: String,
    lastName: String,
    username: String,
    email: String,
    phone: Number,
    password: String,
    googleId: String,
    secret: Array
});



userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dash"

    
    // userProfileURL:"http://www.googleapis.com/oauth2/v3/userinfo"

},
    function (accessToken, refreshToken, profile, cb) {
        // console.log(profile);



        User.findOrCreate({ googleId: profile.id, username: profile.displayName, firstname: profile.name.givenName, lastName: profile.name.familyName }, function (err, user) {
            if (err) {
                res.render("errorpage", { message: err });
            }
            return cb(err, user);
        });
    }
));


app.get('/auth/google',
    passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/dash",
    passport.authenticate("google", { failureRedirect: "/?error=log" }),
    function (req, res) {
        // Successful authentication, redirect secrests page.
        res.redirect('/');
    });


// ---------------------------------------------------------------------------

app.get("/signin", function (req, res) {
    const response = req.query.error;
    // var x=req.isAuthenticated();
    res.render("signin", { errortext: response });
});


app.get("/",(req,res)=>{
    res.render("home");
})
app.get("/signup",(req,res)=>{
    res.render("signup");
})

app.get("/mentor",(req,res)=>{
    res.render("mentor");
})
app.get("/user",(req,res)=>{
    res.render("user");
})









app.listen("3000",()=>{
    console.log("server started at port : 3000")
})