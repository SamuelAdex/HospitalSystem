const {Router} = require('express');
const Emergency = require('../models/Emergency')

let router = Router()

router.get('/', (req, res, next)=>{
    res.render('index', {auth: req.isAuthenticated(), user: req.user, errors})
    console.log(req.user)
})

router.get('/emergency', (req, res, next)=>{
    res.render('emergency', {auth: req.isAuthenticated(), user: req.user, errors})
})

router.get('/covid', (req, res, next)=>{
    res.render('covid', {auth: req.isAuthenticated(), user: req.user, errors})
})


/* POSt Request For Emergency Route */
let errors = [];
router.post('/emergency', async (req, res, next)=>{
    const {Firstname, Lastname, Age, Address, Landmark, Phone} = req.body
    if(!Firstname || !Lastname || !Age || !Address || !Landmark || !Phone){
        errors.push({msg: "⚠️ Fields Cannot be Empty!!!"})
    }
    
    if(errors.length > 0){
        res.render('emergency',{
            Firstname,
            Lastname,
            Age,
            Address,
            Landmark,
            Phone,
            errors,
            auth: req.isAuthenticated()
        });
    }else{
        const newCase = new Emergency({
            Firstname,
            Lastname,
            Age,
            Address,
            Landmark,
            Phone
        });

        try {
            await newCase.save()
            req.flash('success_msg', '✅ Case Reported Successfully!!!')
            res.redirect('/emergency')
        } catch (error) {
            console.log(`Error:: ${error}`)
            res.status(404).send("404, Page Not Found")
        }
    }
})





module.exports = router;