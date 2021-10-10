module.exports = {
    ensureAuth: (req, res, next)=>{
        if(req.isAuthenticated()){
            return next()
        }else{
            req.flash('error_msg', '⚠️ Authentication Needed To Access This Page')
            res.redirect('/Auth/login')
        }
    }
}