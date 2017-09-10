
const { check, validationResult } = require('express-validator');

const checkParams = (req, res, next) => {

    req.sanitize('symbol').escape();
    req.sanitize('symbol').trim();
    req.checkBody('symbol', 'Symbol is required').notEmpty(); 

    req.sanitize('shares').escape();
    req.sanitize('shares').trim();
    req.checkBody('shares', 'Invalid number').notEmpty().isInt();
    
    const errors = req.validationErrors();
    
        if (errors) {
            res.render('apologize', { message: 'Please provide valid parameters!'});
            return;
        } else {
            next();
        }
    
};

const checkParam = (req, res, next) => {
    
    req.sanitize('symbol').escape();
    req.sanitize('symbol').trim();
    req.checkBody('symbol', 'Symbol is required').notEmpty(); 
    const errors = req.validationErrors();

    if (errors) {
        res.render('apologize', { message: 'Please provide a symbol'});
        return;
    } else {
        next();
    }

};

module.exports = {checkParams, checkParam};