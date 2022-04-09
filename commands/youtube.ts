import { Message } from "discord.js"
import config from "../private/config.json"
import ytdl from "ytdl-core-discord"
import {
	AudioPlayer,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	StreamType
} from "@discordjs/voice"
import { OpusEncoder } from "@discordjs/opus"

exports.run = async (client, message: Message) => {
	const connection = joinVoiceChannel({
		channelId: message.member.voice.channelId,
		guildId: message.guildId,
		adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator
	})

	try {
		const stream = await ytdl("https://www.youtube.com/watch?v=EMjYgK4j5z4", {
			// highWaterMark: 1 << 25,
			filter: "audioandvideo"
		})
		console.log(stream)
		const player = createAudioPlayer()
		const resource = createAudioResource(stream, { inputType: StreamType.Opus })
		connection.subscribe(player)
		player.play(resource)
		console.log("playing")

		message.channel.send("lol no")
	} catch (error) {
		const errorMessage = error.toString().includes("0.0.0.0:443")
			? `Ich kann noch keine Livestreams!\n${error}`
			: `E Rohr isch bassiert\n${error}`
		message.channel.send(errorMessage)
	}
}
