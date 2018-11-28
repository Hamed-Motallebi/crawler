var Tools = function () {
};

Tools.prototype.datePart = (date, separator) => {
    return date.toISOString().split(separator)[0];
};

Tools.prototype.datePartNumber = (date, separator) => {
    return date.toISOString().split(separator)[0].replace(/-/g, '');
};

Tools.prototype.timePart = (date, separator) => {
    return date.toISOString().split(separator)[1];
};

module.exports = new Tools();