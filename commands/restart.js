const pm2 = require("pm2")
const config = require("../private/config.json")

exports.run = (client, message) => {
	if (
		message.member.id == config.ids.userIDS.tim ||
		message.member.id == config.ids.userIDS.christoph ||
		message.member.id == config.ids.userIDS.dim
	) {
		message.channel.send("🤖Restarting...")
		pm2.connect(function (err) {
			if (err) {
				console.error(err)
				process.exit(2)
			}

			pm2.restart(process.env.pm_id, (err, proc) => {})
			pm2.flush(process.env.pm_id, (err, proc) => {})
			pm2.restart(process.env.pm_id, (err, proc) => {})
		})
	}
}
