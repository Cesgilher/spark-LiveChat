const moment = require('moment');

function formatMessage(username, content) {
    return {
        username,
        content,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage;