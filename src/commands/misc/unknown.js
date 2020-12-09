const { Command } = require('discord.js-commando')

module.exports = class UnknownCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unknown',
			group: 'misc',
			memberName: 'misc',
			description: 'Runs when an unknown command is run',
			ownerOnly: true,
			hidden: true,
			unknown: true,
		})
	}

	run(message) {
		if (message.content.includes(' ')) {
			let unknownCommand = message.content.split(/\s+/g)[0]
			console.log(`An unknown command was run : ${unknownCommand}`)
		} else {
			console.log(`An unknown command was run : ${message.content}`)
		}
	}
}
