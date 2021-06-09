const config = require('../private/config.json')
var prefix = config.prefix;


exports.run = async (client, message) => {
	if (message.author.bot) return;
	//check if user has the right permissions
	if (message.content.startsWith(prefix)) {
		if (!(message.member._roles.find(role => role == config.ids.roleIDS.adminRole))) return message.reply('You do not have the permissions to perform that command.');
		let messageArray = message.content.split(" "),
			cmd = messageArray[0],
			args = messageArray.slice(1),
			commandfile = client.commands.get(cmd.slice(prefix.length)) || client.aliases.get(cmd.slice(prefix.length));

		if (commandfile == undefined) return;
		try {
			message.delete();
			commandfile.run(client, message, args);
			console.log(`${message.author.username} used ${cmd}`)
		} catch (error) {
			console.error(error);
		}
	}
}