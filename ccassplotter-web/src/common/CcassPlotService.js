const baseUrl = process.env.REACT_APP_CCASS_PLOT_FLASK_BASK_URL;
const getHistoricalHoldingsUrl = baseUrl + '/getHistoricalHoldings';
const getFindTransactionsUrl = baseUrl + '/findTransactions';

const getQueryString = (params) => {
    return Object.keys(params).map((key) => {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    }).join('&');
};

const getAsyncHistoricalHoldings = async (numberOfHolders, stockCode, startDate, endDate) => {
    const url = getHistoricalHoldingsUrl + '?' + getQueryString({
        NumberOfHolders: numberOfHolders,
        StockCode: stockCode,
        StartDate: startDate,
        EndDate: endDate
    });

    return (await fetch(url)).json();
};

const getAsyncFindTransactions = async (threshold, stockCode, startDate, endDate) => {
    const url = getFindTransactionsUrl + '?' + getQueryString({
        Threshold: threshold,
        StockCode: stockCode,
        StartDate: startDate,
        EndDate: endDate
    });

    return (await fetch(url)).json();
};


export {
    getAsyncHistoricalHoldings,
    getAsyncFindTransactions
};