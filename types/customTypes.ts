import { readdirSync } from "fs"
import {
	Client,
	Message,
	Collection,
	User,
	CommandInteraction,
	AutocompleteInteraction,
	ButtonInteraction,
	SelectMenuInteraction,
	ApplicationCommand,
	MessageContextMenuInteraction
} from "discord.js"

/**
 * Extended version of the default {@link Client} with addidtional functions and properties.
 * @extends { Client}
 */
export class DiscordClient extends Client {
	/**
	 * Collection of all commands to use
	 * @type {Collection<string, Command>}
	 */
	public commands: Collection<string, Command>

	/**
	 * Collection of all interactions to use
	 * @type {Collection<string, InteractionCommands>}
	 */
	public interactions: Collection<string, InteractionCommands>

	/**
	 * Config file imported into the DiscordClient for global access
	 * @type { [key: string]: any }
	 */
	public config: { [key: string]: any }

	/**
	 * Object with ids of discord-games
	 */
	public applications: {
		awkword: string
		betrayal: string
		checkers: string
		chess: string
		chessdev: string
		doodlecrew: string
		fishing: string
		lettertile: string
		poker: string
		puttparty: string
		sketchyartist: string
		spellcast: string
		wordsnack: string
		youtube: string
		youtubedev: string
	}
}

/**
 * Extended Message to hold {@link DiscordUser}.
 */
export interface DiscordMessage extends Message {
	author: DiscordUser
}

/**
 * Extended {@link AutocompleteInteraction} to hold {@link DiscordUser}
 */
export interface DiscordAutocompleteInteraction extends AutocompleteInteraction {
	user: DiscordUser
}

/**
 * Extended {@link ButtonInteraction} to hold {@link DiscordUser}
 */
export interface DiscordButtonInteraction extends ButtonInteraction {
	user: DiscordUser
}

/**
 * Extended {@link CommandInteraction} to hold {@link DiscordUser}
 */
export interface DiscordCommandInteraction extends CommandInteraction {
	user: DiscordUser
}

/**
 * Extended {@link MessageContextMenuInteraction} to hold {@link DiscordUser}
 */
export interface DiscordMessageContextMenuInteraction
	extends MessageContextMenuInteraction {
	user: DiscordUser
}

/**
 * Extended {@link SelectMenuInteraction} to hold {@link DiscordUser}
 */
export interface DiscordSelectMenuInteraction extends SelectMenuInteraction {
	user: DiscordUser
}

// /**
//  * Extended {@link UserContextMenuInteraction} to hold {@link DiscordUser}
//  */
// export interface DiscordUserContextMenuCommandInteraction extends UserContextMenuCommandInteraction {
//   user: DiscordUser
// }

/**
 * Extended User to hold language.
 */
export interface DiscordUser extends User {
	language: string
}

/**
 * Interface for translation parameters
 */
interface translation_options {
	key: string | string[]
	lng?: string
	options?: object | string
}

/**
 * Interface of Command structure
 */
interface Command extends Object {
	name: string
	description: string
	usage: string
	example: string
	aliases: string[]
}

interface InteractionCommands extends Object {
	name: string
	description: string
	usage: string
	Autocomplete?: any
	Button?: any
	Command?: any
	MessageContextMenu?: any
	SelectMenu?: any
	UserContextMenu?: any
}

/**
 * Extended {@link ApplicationCommand} to hold {@link DiscordUser}
 */
export interface DiscordApplicationCommand extends ApplicationCommand {
	user: DiscordUser
}
