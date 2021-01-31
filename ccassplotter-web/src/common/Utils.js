const formatDate = (date) => {
    try {
        return date.toISOString().slice(0, 10).replace(/-/g, "");
    } catch (error) {
        console.log(error)
        return "";
    }
}

const addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const validateInput = (stockCode, numberOfHolders) => {
    if (stockCode.length !== 5) {
        return "Invalid StockCode";
    }
    if (numberOfHolders <= 0) {
        return "Number Of Holders Should Be Greater Than 0";
    }
    return "";
}

const createString = (obj) => {
    let resultString = ""
    for (const [key, value] of Object.entries(obj)) {
        resultString += `${key}: ${value}\n`
    }
    return resultString;
}

export { formatDate, addDays, validateInput, createString };
