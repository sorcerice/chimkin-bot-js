const { Message } = require('discord.js')
const { Command } = require('discord.js-commando')

module.exports = class PurgeCommand extends (
	Command
) {
	constructor(client) {
		super(client, {
			name: 'purge',
			aliases: ['clear'],
			group: 'mod',
			memberName: 'purge',
			description: 'Deletes specified number of messages',
			clientPermissions: ['MANAGE_MESSAGES'],
			userPermissions: [
				'MANAGE_MESSAGES',
				['KICK_MEMBERS'],
				['BAN_MEMBERS'],
			],
			args: [
				{
					key: 'number',
					prompt:
						'Please provide the number of messages you want to delete',
					type: 'integer',
					default: 2,
				},
			],
			guildOnly: true,
		})
	}

	async run(message, { number }) {
		message.channel
			.bulkDelete(number + 1)
			.then(async messages => {
				let notifMsg = await message.channel.send(
					`Deleted ${messages.size - 1} messages`
				)
				notifMsg.delete({ timeout: 1000 })
			})
			.catch(async error => {
				let errMsg = await message.channel.send(
					'Messages that were not deleted were more than 14 days old. I do not have access to them.'
				)
				errMsg.delete({ timeout: 1500 })
			})
	}
}
