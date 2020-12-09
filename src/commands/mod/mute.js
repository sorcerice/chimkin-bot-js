const { Command } = require('discord.js-commando')

module.exports = class MuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mute',
			group: 'mod',
			memberName: 'mute',
			description:
				'Mention the user you want to mute along with the mute time',
			clientPermissions: ['MANAGE_ROLES'],
			userPermissions: ['MANAGE_ROLES'],
			args: [
				{
					key: 'mention',
					prompt: 'I need you to tag the person to mute!',
					type: 'string',
				},
				{
					key: 'duration',
					prompt:
						'I need you to tell me how long to mute the person\n`d=days, h=hours, m=minutes, s=seconds`\neg: `2d2h5m6s` = 2days 2hours 5minutes 6seconds',
					type: 'string',
				},
				{
					key: 'reason',
					prompt: 'What was the reason for the mute?',
					type: 'string',
				},
			],
			guildOnly: true,
		})
	}

	async run(message, { mention, duration, reason }) {
		const { guild } = message
		const muteRole = guild.roles.cache.find(role => role.name === 'Muted')
		const memberID = mention.match(/\d{18}/g)[0]
		const member = guild.members.cache.get(memberID)

		let day = duration.match(/\d{1,}[d]/gi)
		let hour = duration.match(/\d{1,}[h]/gi)
		let minute = duration.match(/\d{1,}[m]/gi)
		let second = duration.match(/\d{1,}[s]/gi)

		const dayValue = day ? day[0].match(/\d{1,}/g)[0] : 0
		const hourValue = hour ? hour[0].match(/\d{1,}/g)[0] : 0
		const minuteValue = minute ? minute[0].match(/\d{1,}/g)[0] : 0
		const secondValue = second ? second[0].match(/\d{1,}/g)[0] : 0

		let durationValue =
			dayValue * 86400000 +
			hourValue * 3600000 +
			minuteValue * 60000 +
			secondValue * 1000

		if (member.roles.cache.some(role => role.name === 'Muted')) {
			await message.say(`${member.displayName} is already muted`)
		} else {
			await member.roles.add(muteRole, reason)
			message.channel.send(`${member.user.tag} has been muted`)
			setTimeout(() => {
				member.roles.remove(muteRole, 'Mute duration expired')
				message.channel.send(
					`${member.user.tag} has been unmuted as the mute duration has expired`
				)
			}, durationValue)
		}
	}
}
