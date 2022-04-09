import { SlashCommandBuilder } from "@discordjs/builders"
import {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	StreamType
} from "@discordjs/voice"
import ytdl from "ytdl-core-discord"
import { DiscordClient, DiscordCommandInteraction } from "../types/customTypes"

export const data = new SlashCommandBuilder()
	.setName("youtube")
	.setDescription("Prüft, ob der Bot ordnungsgemäß antwortet")
	.addStringOption((option) =>
		option
			.setName("video")
			.setDescription("URL of se Video das du hören willsd.")
			.setRequired(true)
	)

exports.Command = async (
	client: DiscordClient,
	interaction: DiscordCommandInteraction
): Promise<void> => {
	const guild = client.guilds.cache.get(interaction.guildId)
	const member = guild.members.cache.get(interaction.member.user.id)
	const voiceChannel = member.voice.channel
	const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: interaction.guildId,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator
	})

	try {
		const url = interaction.options.getString("video")
		const stream = await ytdl(url, {
			// highWaterMark: 1 << 25,
			filter: "audioandvideo"
		})
		console.log(stream)
		const player = createAudioPlayer()
		const resource = createAudioResource(stream, { inputType: StreamType.Opus })
		connection.subscribe(player)
		player.play(resource)
		console.log("playing")

		interaction.reply("lol what")
	} catch (error) {
		const errorMessage = error.toString().includes("0.0.0.0:443")
			? `Ich kann noch keine Livestreams!\n${error}`
			: `E Rohr isch bassiert\n${error}`
		interaction.reply(errorMessage)
	}
}
