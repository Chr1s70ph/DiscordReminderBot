const pm2 = require('pm2');
const config = require("../private/config.json");

exports.run = (client, message) => {

    message.channel.send("🤖Restarting...")
    pm2.connect(function (err) {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.restart('1', (err, proc) => {})
        pm2.flush('1', (err, proc) => {})
        pm2.restart('1', (err, proc) => {})

    });

}