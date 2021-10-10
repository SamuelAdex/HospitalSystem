const {Router} = require('express');
const {ensureAuth} = require('../../Config/auth')
const bcrypt = require('bcryptjs');
const User = require('../../models/User')
const Appointment = require('../../models/Appointment')
const Doctor = require('../../models/Doctor')
const multer = require('multer')
const fs = require('fs')


let router = Router()
//Setup Multer
let Storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/uploads')
    },
    filename: (req, file, cb)=>{        
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    },    
});


const filefilter = (req, file, cb)=>{
    if(file.mimetype === "image/png" || file.mimetype === 'image/jpg' || file.mimetype === 'image/svg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null, false)
    }
}


const upload = multer({storage: Storage, filefilter: filefilter})

router.get('/dashboard', ensureAuth, async (req, res, next)=>{
    const admin = await User.findOne({role: 'admin'})
    if(admin){
        User.find({role: 'user'})
        .then((users)=>{
            Doctor.find()
            .then((doctors)=>{
                Appointment.find()
                .then((appointments)=>{
                    res.render('admin/dashboard', {user: req.user, errors, users, doctors, appointments})
                })
                .catch((err)=>{
                    console.log(`Error: ${err}`);
                })
            })
            .catch((err)=>{
                console.log(`Error: ${err}`);
            })
        })
        .catch((err)=>{
            console.log(`Error: ${err}`);
        })
    }else{
        req.flash('error_msg', 'Authorization Needed To Access This Page')
        res.redirect('/')
    }
})

router.get('/doctor', ensureAuth, (req, res, next)=>{
    Doctor.find()
    .then((doctors)=>{
        res.render('admin/doctor', {user: req.user, errors, doctors})
    })
})


router.get('/appointments', ensureAuth, (req, res, next)=>{
    Appointment.find().populate('doctor').sort({createdAt: 'desc'})
    .then((appointments)=>{
        res.render('admin/appointments', {appointments, errors})
    })
    .catch((err)=>{
        console.log(`Error::${err}`)
        res.status(404).send('404, Page Not Found :)')
    })
})


router.get('/patients', ensureAuth, (req, res, next)=>{
  User.find({role: 'user'}).sort({createdAt: 'desc'})
  .then((users)=>{
    res.render('admin/patients', {users})
  })
  .catch((err)=>{
      console.log(`Error:: ${err}`)
      res.status(404).send('404, Page Not Found!!!')
  })
})

/* Add Doctor POST Request Route */
let errors = [];
router.post('/addDoctor', upload.single('image'), ensureAuth, (req, res, next)=>{
    const {Firstname, Lastname, email, username, phone, position, gender, password, password1} = req.body;
    if(!Firstname || !Lastname || !email || !username || !phone  ||!position || !gender || !password || !password1){
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
        res.render('admin/doctor', {
            Firstname,
            Lastname,
            email,
            username,
            phone,
            position, 
            gender,
            password,
            password1,
            errors
        })
    }else{
       
        //Validation passed
        Doctor.findOne({email: email})
        .then(doctor =>{
            if(doctor){
                req.flash("error_msg", "⚠️ Email Already Registered");
                res.render('register', {
                    Firstname,
                    Lastname,
                    email,
                    username,
                    phone,
                    position, 
                    gender,
                    password,
                    errors
                })
            }else{
                const profile = req.file.filename;
                const newDoctor = new Doctor({
                    Firstname,
                    Lastname,
                    email,
                    username,
                    phone,
                    position, 
                    gender,
                    password,
                    profile
                });
                
                //Hash Password
                bcrypt.genSalt(10, (err, salt)=> bcrypt.hash(newDoctor.password, salt, (err, hash)=>{
                    if(err) throw err;
                    //Set password to hashed
                    newDoctor.password = hash;
                    //Save User
                    newDoctor.save()
                        .then(user => {
                            req.flash("success_msg", "✅ Doctor Created Successfully :)")
                            res.redirect('/admin/allDoctor')
                        })
                        .catch(err => console.log(err));
                }))

            }
        })
    }
})


/* Edit Appointment PUT Request */
router.put('/editAppoint/:id', ensureAuth, (req, res, next)=>{
    const id = req.params.id;
    Appointment.findByIdAndUpdate({_id: id})
    .then((appointment)=>{
        appointment.time = req.body.time
        appointment.date = req.body.date
        appointment.timeType = req.body.timeType
        appointment.condition = req.body.condition
        appointment.save()
        .then((appoint)=>{
            req.flash('success_msg', '✅ Appointment Updated')
            res.redirect('/admin/appointments')
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


/* PUT Request for Doctor */
router.put('/editDoctor/:id', ensureAuth, (req, res, next)=>{
    const id = req.params.id;

    Doctor.findByIdAndUpdate({_id: id})
    .then((doctor)=>{
        doctor.Firstname = req.body.Firstname;
        doctor.Lastname = req.body.Lastname;
        doctor.username = req.body.username;
        doctor.email = req.body.email;
        doctor.phone = req.body.phone;
        doctor.gender = req.body.gender;
        doctor.position = req.body.position;

        doctor.save()
        .then((result)=>{
            req.flash('success_msg', '✅ Profile Updated Successfully')
            res.redirect('/admin/doctor');
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


/* DELETE Request for Doctor */
router.delete('/deleteDoctor/:id', ensureAuth, (req, res, next)=>{
    const id = req.params.id;
    Doctor.findByIdAndRemove({_id: id})
    .then((result)=>{
        req.flash('success_msg', `✅ Dr. ${result.Firstname}'s Account Has been Deleted Successfully`)
        res.redirect('/admin/doctor')
    })
    .catch((error)=>{
        console.log(`Error: ${error}`)
        res.status(404).send("404, Page Not Found :)")
    })
})

/* DELETE Request for Appointment */
router.delete('/:id/delete', ensureAuth, (req, res, next)=>{
    const id = req.params.id;
    Appointment.findByIdAndDelete({_id: id})
    .then((result)=>{
        req.flash('success_msg', '✅ Appointment Deleted Successfully :)')
        res.redirect('/admin/appointments')
    })
})

module.exports = router