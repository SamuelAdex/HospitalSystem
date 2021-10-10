const {Router} = require('express');
const mongoose = require('mongoose')
const Doctor = require('../models/Doctor')
const User = require('../models/User')
const Appointment = require('../models/Appointment')
const {ensureAuth} = require('../Config/auth')

let router = Router();


/* GEt Request for Appointment Page */
router.get('/appoint', ensureAuth, (req, res, next)=>{
    User.findOne({role: 'user'})
    .then((userRole)=>{
        if(userRole){
            Appointment.find({user: req.user.id})
            .populate('doctor')
            .lean().sort({createdAt: 'desc'})
            .then((appoints)=>{               
                Doctor.find()
                .then((doctors)=>{
                    res.render('appoint', {doctors, auth: req.isAuthenticated(), user: req.user, errors, appoints})       
                   // appoints.forEach((appoint)=> console.log(appoint.doctor.Firstname))
                })
                .catch((err)=>{
                    res.status(404).send('404, Page Not Found!!!')
                    console.log(`Error:: ${err}`)
                })
            })
            .catch((err)=>{
                res.status(404).send('404, Page Not Found!!!')
                console.log(`Error:: ${err}`)
            })
        }else{
            req.flash('error_msg', 'You Are Not A Patient')
            res.redirect('/Auth/login')
        }
    })
    .catch((err)=>{
        res.status(404).send('404, Page Not Found!!!')
        console.log(`Error:: ${err}`)
    })
})


/* POSt Request for Appointment */
let errors = [];
router.post('/create', ensureAuth, (req, res, next)=>{
    const {Firstname, Lastname, Age, time, date, doctor} = req.body;
    if(!Age || !time || !date || !doctor){
        errors.push({msg: "⚠️ Fields Cannot Be Empty"})
    }

    if(errors.length > 0){
        res.render('appoint', {
            Firstname,
            Lastname,
            Age,
            time,
            date,
            doctor,
            errors
        })
    }else{     
        Doctor.findOne({_id: req.body.doctor})
        .then((doctor)=>{
            const appoint = new Appointment({
                Firstname: req.body.Firstname,
                Lastname: req.body.Lastname,
                Age: req.body.Age,
                time: req.body.time,
                timeType: req.body.timeType,
                date: req.body.date,
                condition: req.body.condition,
                doctor: req.body.doctor,
                user: req.user.id
            })
            doctor.appointments.push(appoint)
            doctor.save()
            .then((result)=>{
                appoint.save()
                .then((app)=>{
                    req.flash('success_msg', '✅ Appointment Added')
                    res.redirect('/appointment/appoint')
                })
                .catch((err)=>{
                    console.log(`Error::: ${err}`)
                    res.status(404).send('404, Page Not Found!!!')
                })
            })
            .catch((err)=>{
                console.log(`Error::: ${err}`)
                res.status(404).send('404, Page Not Found!!!')
            })                
        })
        .catch((err)=>{
            console.log(`Error::: ${err}`)
            res.status(404).send('404, Page Not Found!!!')
        })
    }
})


/* DELETE Request for Appointment */
router.delete('/appoint/:id/delete', ensureAuth, (req, res, next)=>{
    Appointment.findByIdAndRemove({_id: req.params.id})
    .then((result)=>{
        req.flash('error_msg', '✅ Appointment Deleted')
        res.redirect('/appointment/appoint')
    })
    .catch((err)=>{
        console.log(`Error:: ${err}`)
        res.status(404).send('404, Page Not Found :)')
    })
})


module.exports = router