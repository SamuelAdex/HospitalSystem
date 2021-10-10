if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose')
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require('method-override');



let app = express();

//Passport config
require('./Config/passport')(passport);



/* Database Connection */
const db = process.env.DATABASE_URL
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
}).then((result)=>{
    console.log("Database Connected :)")
}).catch((err)=>{
    console.log(`Database Error:: ${err}`)
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

//Express Session
app.use(session({
    secret: "672692ddgsjd",
    resave: true,
    saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash())

//Global Variable
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
});

app.use(morgan('dev'))
app.use(methodOverride('_method'));


const indexRouter = require('./routes/index')
app.use('/', indexRouter)


const userRouter = require('./routes/user')
app.use('/Auth', userRouter)

const doctorRouter = require('./routes/doctor/doctor')
app.use('/doctor', doctorRouter)

const adminRouter = require('./routes/admin/admin')
app.use('/admin', adminRouter)


const appointRouter = require('./routes/appointment')
app.use('/appointment', appointRouter)




const Port = process.env.PORT || 8081;
app.listen(Port, ()=>{
    console.log(`Running On Port ${Port}`)
});