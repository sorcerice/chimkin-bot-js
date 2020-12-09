const { Command } = require('discord.js-commando')

module.exports = class MuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unmute',
			group: 'mod',
			memberName: 'unmute',
			description: 'Chimkin will unmute a muted person',
			args: [
				{
					key: 'mention',
					prompt: 'I need you to mention the person to unmute!',
					type: 'string',
				},
				{
					key: 'reason',
					prompt: "What's the reason for unmuting this person?",
					type: 'string',
				},
			],
			guildOnly: true,
		})
	}

	async run(message, { mention, reason }) {
		const { guild } = message
		const memberID = mention.match(/\d{18}/g)[0]
		const member = guild.members.cache.get(memberID)
		const mutedRole = guild.roles.cache.find(role => role.name === 'Muted')

		if (member.roles.cache.some(role => role.name === 'Muted')) {
			member.roles.remove(mutedRole)
			await message.say(`${member.user.tag} was unmuted`)
		} else {
			await message.say('This person is not muted')
		}
	}
}
