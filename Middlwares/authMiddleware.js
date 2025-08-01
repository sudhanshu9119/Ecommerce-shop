
module.exports.authUser= (req, res, next) => {
    if (req.session.loggedIn) {
      console.log(req.session.loggedIn)
      return next(); 
    
  }else{
    res.redirect('/login'); 
  };
}