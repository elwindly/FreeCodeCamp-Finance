const { User } = require('./../models/members');

var authenticate = (req, res, next) => {

    if (req.session.name) {
        next();
    } else {
        res.redirect('/login')
    }
};

module.exports = {authenticate};