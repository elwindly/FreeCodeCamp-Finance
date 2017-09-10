const yahooFinance = require('yahoo-finance');

function currencyFormatter(num, currency) {
    return currency + "" + num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
}

function getStockData(symbol) {
    return yahooFinance.quote({
        symbol: symbol,
        modules: [ 'price']
    });
}


module.exports = { currencyFormatter, getStockData };