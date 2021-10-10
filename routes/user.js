const {Router} = require("express");
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');



let router = Router();


/* GEt Request For Register Page */
router.get('/register', (req, res, next)=>{
    res.render('register', {errors})
})


/* GET Request for Login Page */
router.get('/login', (req, res, next)=>{
    res.render('login', {errors})
})


/* POST Request for Register Page */
let errors= [];
router.post('/register', (req, res, next)=>{
    const {Firstname, Lastname, email, username, phone, password, password1} = req.body;
    if(!Firstname || !Lastname || !email || !username || !phone || !password || !password1){
        errors.push({msg: "⚠️ Fields Cannot be Empty ⚠️"})
    }

    if(phone.length < 14){
        errors.push({msg: "⚠️ Contact must contain (Country Code: +234) ⚠️"})
    }

    if(password !== password1){
        errors.push({msg: "⚠️ Password Mismatch ⚠️"})
    }

    if(password.length < 6){
        errors.push({msg: "⚠️ Password Must be Up to 6 characters and Above ⚠️"})
    }

    if(errors.length > 0){
        res.render('register', {
            Firstname,
            Lastname,
            email,
            username,
            phone,
            password,
            password1,
            errors
        })
    }else{
       
        //Validation passed
        User.findOne({email: email})
        .then(user =>{
            if(user){
                req.flash("error_msg", "⚠️ Email Already Registered");
                res.render('register', {
                    Firstname,
                    Lastname,
                    email,
                    username,
                    phone,
                    password,
                    errors
                })
            }else{
                const newUser = new User({
                    Firstname,
                    Lastname,
                    email,
                    username,
                    phone,
                    password
                });
                
                //Hash Password
                bcrypt.genSalt(10, (err, salt)=> bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    if(err) throw err;
                    //Set password to hashed
                    newUser.password = hash;
                    //Save User
                    newUser.save()
                        .then(user => {
                            req.flash("success_msg", "✅ You are now Registered")
                            res.redirect('/Auth/login')
                        })
                        .catch(err => console.log(err));
                }))

            }
        })
    }
    
})

//Login Handle
router.post('/login', (req, res, next)=>{
    passport.authenticate('local-signup1', {
        successRedirect: '/',
        failureRedirect: '/Auth/login',
        failureFlash: true
    })(req, res, next)
    
});

//Logout Handle
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', '✅ You are Logged out');
    res.redirect('/Auth/login');
})


module.exports = router;