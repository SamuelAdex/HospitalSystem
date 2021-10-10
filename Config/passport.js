const LocalStrategy = require("passport-local").Strategy;
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

//Load User model
const User = require('../models/User');
const Doctor = require('../models/Doctor');


/* SessionConstructor */
function SessionConstructor(userId, userGroup, details){
    this.userId = userId;
    this.userGroup = userGroup;
    this.details = details
}


module.exports = function(passport){
    passport.use('local-signup1',
        new LocalStrategy({ usernameField: 'email'}, (email, password, done)=>{
            //Match User
            User.findOne({email: email})
              .then(user =>{
                  if(!user){
                      return done(null, false, { message: "⚠️ That email is not Registered"});
                  }

                  //Match Password
                  bcrypt.compare(password, user.password, (err, isMatch)=>{
                      if(err) throw err;

                      if(isMatch){
                          return done(null, user, {message: "✅ Welcome To Your Dashboard"})
                      }else{
                          return done(null, false, { message: "⚠️ Password Incorrect"})
                      }
                  })
              })
              .catch(err => console.log(err))
        })
    );

    passport.use('local-signup2',
        new LocalStrategy({ usernameField: 'email'}, (email, password, done)=>{
            //Match User
            Doctor.findOne({email: email})
              .then(doctor =>{
                  if(!doctor){
                      return done(null, false, { message: "⚠️ That User was not a Doctor"});
                  }

                  //Match Password
                  bcrypt.compare(password, doctor.password, (err, isMatch)=>{
                      if(err) throw err;

                      if(isMatch){
                          return done(null, doctor, {message: "✅ Welcome To Your Dashboard"})
                      }else{
                          return done(null, false, { message: "⚠️ Password Incorrect"})
                      }
                  })
              })
              .catch(err => console.log(err))
        })
    );

    

    /* Serialize and Deserialize */
    passport.serializeUser(function(user, done){
        done(null, {_id: user.id, role: user.role})
    });

    passport.deserializeUser(function(id, done){
       /* if(user.role === 'user' || user.role === 'admin'){
           User.findOne(user, function(err, user){
               if(user){
                   done(null, user)
               }else{  
                   done(err, {message: '⚠️User Not Found!!!'})
               }
           })
       }
       if(user.role === 'doctor'){
           Doctor.findOne(user, function(err, admin){
               if(admin){
                   done(null, admin)
               }else{
                   done(err, {message: "⚠️ Admin Not Found"})
               }
           })
       } */
       Doctor.findById(id, function(err, doctor){
           if(err) return done(err);
           if(doctor) return done(null, doctor);
           User.findById(id, function(err, user){
               done(err, user)
           })
       })
    });
    
}