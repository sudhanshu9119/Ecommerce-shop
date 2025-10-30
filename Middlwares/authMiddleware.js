
module.exports.authUser= (req, res, next) => {
    if (req.session.loggedIn) {
      return next(); 
    
  }else{
    res.redirect('/login'); 
  };
}