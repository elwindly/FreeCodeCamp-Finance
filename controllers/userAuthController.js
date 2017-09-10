const express = require('express');
const { User } = require('./..//models/members');
const _ = require('lodash');


function UserAuthController () {
    this.loginPage = (req, res) => {
        res.render('login');
    };

    this.signUpPage = (req, res) => {
        res.render('signup');
    };

    this.signUp = ( async (req, res) => {
        
        const body = _.pick(req.body,['username', 'password', 'passwordagain']);

        if (body.password !== body.passwordagain) {
            res.render('apologize', {message: 'Passwords do not match!'});
        }

        try {
            const existUsername = await User.findOne({name: body.username});
            if (existUsername) {
                res.render('apologize', {message: 'User already exist'});
            } 
            const user = new User(body);
            const savedUser = await user.save();
            req.session.name = savedUser.name;
            req.session.cash = savedUser.cash;
            req.session._id = savedUser._id;
            res.redirect('/');

        } catch (error) {
            res.render('apologize', {message: 'Something happened, please try it later!'});
        }     
    });

    this.logIn = ( async (req, res) => {

        const body = _.pick(req.body, ['username','password']);

        try {
            const user = await User.findByCredentials(body.username, body.password);
            req.session.name = user.name;
            req.session._id = user._id;
            req.session.cash = user.cash;
            res.redirect('/');
        } catch (e) {
            res.render('apologize', {message: 'Invalid credinials!'});
        }
    });

    this.logOut = ((req, res) => {
        req.session.name = null;
        req.session._id = null;
        req.session.cash = null;
        req.session.destroy(function(err) {
            res.redirect('/login');
        })
    });
}

module.exports = UserAuthController;