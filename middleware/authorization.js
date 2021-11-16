const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    //   get the token from the authorization header
    const token = req.headers.authorization.split(" ")[1];
    // verify the token
    const user = jwt.verify(token, 'lucifer_secret')
    // attach the user email to the request
    res.locals.userEmail = user.email;
    // attach user email to request object
    req.userEmail = user.email;
    next();
    console.log(token);
  } catch (error) {
    res.status(401).json({ okay: false, message:'Please session expired,login again'})
  }
};
