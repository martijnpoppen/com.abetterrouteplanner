sleep = async function (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

getCurrentDatetime = function() {
    const dt = new Date();

    return dt.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })
}

module.exports = {
    sleep,
    getCurrentDatetime
};
