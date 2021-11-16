const express = require("express");
const path = require('path');
const user = require('./controllers/users');
const app = express();
const authorization= require('./middleware/authorization');
const morgan = require('morgan');


app.use(express.json());
app.use(express.json({ urlEncoded: false }));

app.use(express.static("./views"));
app.use(express.static(path.resolve("public")));
app.use(morgan('dev'));


app.get('/', user.homepage);
app.get("/profile", user.profile);

app.post('/user/signup', user.createUser);
app.post('/user/login', user.signin);
app.post('/profile', authorization,user.getprofile);
app.patch('/profile', authorization,user.updateprofile);

app.listen(3000, () => {
  console.log("app is running")
})
