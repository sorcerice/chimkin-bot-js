const { Command } = require('discord.js-commando')

module.exports = class KickCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'kick',
			group: 'mod',
			memberName: 'kick',
			description: 'Chimkin will kick this person from the server',
			clientPermissions: ['KICK_MEMBERS'],
			userPermissions: ['KICK_MEMBERS'],
			guildOnly: true,
			args: [
				{
					key: 'mention',
					prompt: 'You need to mention the person to kick',
					type: 'string',
				},
				{
					key: 'reason',
					prompt: 'Please provide a reason for the kick',
					type: 'string',
					default: 'No reason provided',
				},
			],
		})
	}

	async run(message, { mention, reason }) {
		const kickMsg = await message.say(`${mention} is being kicked`)
		const { guild } = message
		const memberID = mention.match(/\d{18}/g)[0]
		let member = guild.members.cache.get(memberID)
		if (member) {
			member.kick(reason)
			kickMsg.edit('Kick success!')
		} else {
			kickMsg.edit("The person you were trying to kick wasn't found")
		}
	}
}
