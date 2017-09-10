const mongoose = require('mongoose');
const Helpers = require('./../helpers/helpers');


const commonRules = {
    type:String,
    required:true,
    trim:true,
    minlength:1    
}

const StocksSchema = new mongoose.Schema({
    symbol: commonRules,
    name: commonRules,
    shares:{
        type: Number
    },
    price: {
        type: Number,
        required: true,   
    }, 
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,      
    }
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true 
    }
});

StocksSchema
    .virtual('total')
    .get(function () {
        return Helpers.currencyFormatter(this.shares * this.price, '$');
})

StocksSchema
    .virtual('formatted-price')
    .get(function () {
    return Helpers.currencyFormatter(this.price, '$');
})


const Stocks = mongoose.model('Stocks', StocksSchema);

module.exports = { Stocks } 