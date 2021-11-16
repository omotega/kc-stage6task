const express = require("express");
const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
let uuid = require("uuid");
uuid = uuid.v4;

const path = require("path");
const { userDatabase, profileDatabase } = require("../models/database");
const accountdb = userDatabase;

exports.homepage = function (req, res) {
  res.render("index.html");
};

exports.profile = function (req, res) {
  res.sendFile(path.resolve("views/profile.html"));
};

exports.createUser = async function (req, res) {
  const objectSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email({ minDomainSegments: 2 }).required(),
    password: joi.string().required(),
    Cpassword: joi.ref("password"),
  });
  try {
    const data = await objectSchema.validateAsync(req.body);
    let { name, email, password } = data;
    password = bcrypt.hashSync(password, 10);
    console.log(password);

    const user = {
      id: uuid(),
      name,
      email,
      password,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const profile = { id: uuid(), name, email };
    accountdb.push(user);
    // save user profile in the db
    profileDatabase.push(profile);
    console.log(user);
    res.json({ okay: true, message: "User created succesfully" });
  } catch (err) {
    console.log(err);
    res.status(422).json({ okay: false, message: err.details[0].message });
  }
};

exports.signin = async function (req, res) {
  const object = joi.object({
    email: joi.string().email({ minDomainSegments: 2 }).required(),
    password: joi.string().required(),
  });
  try {
    const data = await object.validateAsync(req.body);
    const { email, password } = data;
    // find use
    accountdb.find((user) => {
      // find user by email
      if (user.email === email) {
        // verifies user password
        const isPassword = bcrypt.compareSync(password, user.password);
        if (isPassword) {
          // generate user token
          const token = jwt.sign(
            { id: user.id, email: user.email },
            "lucifer_secret",
            { expiresIn: "2d" }
          );
          console.log(token);
          //    send out response
          res
            .status(200)
            .json({
              okay: true,
              token: `Bearer ${token}`,
              message: "logged in succesfully",
            });
        } else {
          res.status(400).json({ okay: true, message: "incorrect password" });
        }
      } else {
        res.status(400).json({ okay: true, message: "user not found" });
      }
    });
  } catch (err) {
    res.status(422).json({ okay: false, message: err.details[0].message });
  }
};

exports.getprofile = async function (req, res) {
  const email = res.locals.userEmail;
  console.log(email);
  // get the user account details
  const account = accountdb.find(data => data.email == email);
  console.log(account);
  // check if user exist
  if (account) {
    // get the user profile details
    profileDatabase.find((profile) => {
      if (profile.email == account.email) {
        // attach the user profile to the user account
        profile.accountId = account.id;
        profile.status = account.status;
        // send out response to the client
        res.status(200).json({ okay: true, data: profile });
      } else {
        res
          .status(404)
          .json({ okay: false, message: " user profile not found" });
      }
    });
  }else{
    res.status(404).json({okay: false, message: "user account not found"});
  }
};


exports.updateprofile = async function (req, res) {
  const email = req.userEmail

  const user = accountdb.find(account => account.email = email)

  if(user){
    profileDatabase.find(profile => {
      const updatedprofile = {...profile, ...req.body}
      res.status(201).json({okay: true, data:updatedprofile});
    })
  }else {
    res.status(404).json({okay: false, message: "user account not found"})
  }
}