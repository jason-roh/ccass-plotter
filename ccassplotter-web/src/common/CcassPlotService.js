const baseUrl = process.env.REACT_APP_CCASS_PLOT_FLASK_BASK_URL;
const getHistoricalHoldingsUrl = baseUrl + '/getHistoricalHoldings';
const getFindTransactionsUrl = baseUrl + '/findTransactions';
const getHealthCheckUrl = baseUrl + '/healthcheck';

const getQueryString = (params) => {
    return Object.keys(params).map((key) => {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    }).join('&');
};

const getAsyncHistoricalHoldings = async (numberOfHolders, stockCode, startDate, endDate, isMulti) => {
    const url = getHistoricalHoldingsUrl + '?' + getQueryString({
        NumberOfHolders: numberOfHolders,
        StockCode: stockCode,
        StartDate: startDate,
        EndDate: endDate,
        IsMulti: isMulti
    });

    return (await fetch(url)).json();
};

const getAsyncFindTransactions = async (threshold, stockCode, startDate, endDate, isMulti) => {
    const url = getFindTransactionsUrl + '?' + getQueryString({
        Threshold: threshold,
        StockCode: stockCode,
        StartDate: startDate,
        EndDate: endDate,
        IsMulti: isMulti
    });

    return (await fetch(url)).json();
};

const getAsyncHealthCheck = async () => {
    return (await fetch(getHealthCheckUrl)).json();
};

export {
    getAsyncHistoricalHoldings,
    getAsyncFindTransactions,
    getAsyncHealthCheck
};