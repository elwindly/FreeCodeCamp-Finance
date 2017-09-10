const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const bcyript = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    password: {
      type: String,
      require: true,
      trim: true,
      minlength: 6
    },
    name: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      minlength: 4
    },
    cash: {
      type: Number,
      default: 10000
    }
});

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject,['_id', 'name']);
};


UserSchema.statics.findByCredentials = function(username, password) {
  var user = this;

  return user.findOne({name: username}).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve,reject) => {
      bcyript.compare(password,user.password, (err,res) => {
        if (!res){
          return reject();
        }
        return resolve(user);
      });
    })   
  });
};

UserSchema.pre('save',function(next){
  var user = this;

  if(user.isModified('password')){
    bcyript.genSalt(10,(err,salt)=>{
      bcyript.hash(user.password,salt,(err,hash)=>{
        user.password = hash;
         next();
      });
    });  
  }else{
    next();
  }

});

var User = mongoose.model('User', UserSchema);

module.exports = { User } 