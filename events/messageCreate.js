const config = require("../private/config.json")
var prefix = config.prefix
const roleIDS = config.ids.roleIDS

exports.run = async (client, message) => {
	if (message.author.bot) return
	//check if user has the right permissions
	if (message.content.startsWith(prefix)) {
		let messageArray = message.content.split(" "),
			commandName = messageArray[0],
			args = messageArray.slice(1),
			commandfile =
				client.commands.get(commandName.slice(prefix.length)) ||
				client.aliases.get(commandName.slice(prefix.length))

		if (commandfile == undefined) return
		if (
			message.guild.id == "763320187528675378" &&
			!message.member._roles.find(
				(role) =>
					role == roleIDS.adminRole || role == roleIDS.developer || role == roleIDS.moderator
			)
		)
			return
		try {
			message.channel.sendTyping()
			commandfile.run(client, message, args)
			setTimeout(() => message.delete(), 500)
			console.log(
				`${message.author.username} used ${commandName} ${
					args.length > 0 ? `with arguments: ${args}` : ""
				}`
			)
		} catch (error) {
			throw new Error(error)
		}
	}
}
