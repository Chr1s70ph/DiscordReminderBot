const config = require("../private/config.json")
var prefix = config.prefix

exports.run = async (client, message) => {
	if (message.author.bot) return
	//check if user has the right permissions
	if (message.content.startsWith(prefix)) {
		let messageArray = message.content.split(" "),
			cmd = messageArray[0],
			args = messageArray.slice(1),
			commandfile =
				client.commands.get(cmd.slice(prefix.length)) ||
				client.aliases.get(cmd.slice(prefix.length))

		if (commandfile == undefined) return
		if (
			message.guild.id == "763320187528675378" &&
			!message.member._roles.find(
				(role) => role == config.ids.roleIDS.adminRole || role == config.ids.roleIDS.developer
			)
		)
			return
		try {
			message.delete()
			commandfile.run(client, message, args)
			console.log(`${message.author.username} used ${cmd}`)
		} catch (error) {
			console.error(error)
		}
	}
}
