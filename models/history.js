const mongoose = require('mongoose');

const Helpers = require('./../helpers/helpers');

const commonRules ={
        type:String,
        required:true,
        trim:true,
        minlength:1    
}
const HistorySchema = new mongoose.Schema({
    symbol: commonRules,
    shares:{
        type: Number
    },
    price: {
        type: Number
    },
    transacted:{
        type: Date,
        default: Date.now
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

HistorySchema
    .virtual('formatted-price')
    .get(function () {
        return Helpers.currencyFormatter(this.price, '$');
})

HistorySchema
    .virtual('formatted-date')
    .get(function () {
        return this.transacted.toUTCString();
})



const History = mongoose.model('History', HistorySchema);

module.exports = { History } 