const { Command } = require('discord.js-commando')

module.exports = class EchoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'echo',
			aliases: ['say'],
			group: 'misc',
			memberName: 'echo',
			description: 'Chimkin screams with what you type',
			clientPermission: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES'],
			args: [
				{
					key: 'text',
					prompt: 'What text would you like the bot to say?',
					type: 'string',
					max: 200,
				},
			],
			argsType: 'single',
		})
	}

	async run(message, { text }) {
		await message.delete()
		await message.channel.send(text)
	}
}
