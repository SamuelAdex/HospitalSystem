const {Router} = require('express');
const {ensureAuth} = require('../../Config/auth')
const User = require('../../models/User')
const Appointment = require('../../models/Appointment')
const Doctor = require('../../models/Doctor')
const passport =require('passport');

let router = Router()

/* Get RequestFor Doctor Dashboard */
router.get('/dashboard', ensureAuth, (req, res, next)=>{
    Appointment.find({doctor: req.user.id})
    .populate('appointment')
    .lean()
    .then((patients)=>{
        res.render('doctor/dashboard', {user: req.user, patients, errors})
    })
})

/*GET Request for allAppointments*/
router.get('/allAppoint', ensureAuth, (req, res, next)=>{
    Appointment.find({doctor: req.user.id})
    .populate('appointment')
    .lean()
    .then((appoints)=>{
        res.render('doctor/appointment', {user: req.user, appoints, errors})
    })
    .catch((err)=>{
        console.log(`Error::: ${err}`)
        res.status(404).send('404. Page Not Found')
    })
})

/* Doctor LoginRouter */
let errors = [];
router.get('/login', (req, res, next)=>{
    res.render('doctor/LogDoctor', {errors})
})


/* Doctor Login POST route */
router.post('/login', (req, res, next)=>{
    passport.authenticate('local-signup2', {
        successRedirect: '/doctor/dashboard',
        failureRedirect: '/doctor/login',
        failureFlash: true
    })(req, res, next)
})


/* Approved Patient's Appointment */
router.post('/cleared/:id', ensureAuth, (req, res, next)=>{
    Appointment.findByIdAndUpdate({_id: req.params.id})
    .then((result)=>{
        result.cleared = true
        result.save()
        .then((results)=>{
            req.flash('success_msg', '✅ Appointment Approved Successfully!!!')
            res.redirect('/doctor/allAppoint')
        })
        .catch((error)=>{
            console.log(`Error: ${error}`)
            res.status(404).send("404, Page Not Found :)")
        })
    })
})


/* UPDATE Request for Appointment */
router.put('/:id/edit', ensureAuth,(req, res, next)=>{
    Appointment.findByIdAndUpdate({_id: req.params.id})
    .then((appointment)=>{
        appointment.time = req.body.time
        appointment.date = req.body.date
        appointment.timeType = req.body.timeType
        appointment.condition = req.body.condition
        appointment.save()
        .then((appoint)=>{
            req.flash('success_msg', '✅ Appointment Updated')
            res.redirect('/doctor/allAppoint')
        })
        .catch((error)=>{
            console.log(`Error: ${error}`)
            res.status(404).send("404, Page Not Found :)")
        })
    })
    .catch((error)=>{
        console.log(`Error: ${error}`)
        res.status(404).send("404, Page Not Found :)")
    })
})


/* DELETE Request For Appointments */
router.delete('/delete/:id', ensureAuth, (req, res, next)=>{
    Appointment.findByIdAndDelete({_id: req.params.id})
    .then((result)=>{
        req.flash('error_msg', '✅ Appointment Deleted')
        res.redirect('/doctor/allAppoint')
    })
    .catch((err)=>{
        console.log(`Error::${err}`)
        res.status(404).send('404, Page Not Found :)')
    })
})


//Logout Handle
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', '✅ You are Logged out');
    res.redirect('/doctor/login');
})

module.exports = router