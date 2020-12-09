const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

module.exports = class BanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			group: 'mod',
			memberName: 'ban',
			description: 'Bans the mentioned person',
			clientPermission: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			args: [
				{
					key: 'mention',
					prompt: 'You need to mention someone to ban',
					type: 'string',
				},
				{
					key: 'reason',
					prompt: 'You need to give the reason for the ban',
					type: 'string',
				},
			],
			argsType: 'multiple',
			guildOnly: true,
		})
	}

	async run(message, { mention, reason }) {
		let banMsg = await message.say(`${mention} is being banned!`)
		const memberID = mention.match(/\d{18}/g)[0]
		let member = message.guild.members.cache.get(memberID)

		if (member) {
			member.ban({ days: 7, reason: reason })
			const bannedUsers = await message.guild.fetchBans()
			const bannedUser = bannedUsers.get(memberID)

			const embed = new MessageEmbed({
				title: 'Ban success',
				author: {
					name: message.author.username,
					iconURL: message.author.avatarURL(),
				},
				description: `${bannedUser.user.tag} was banned!`,
				thumbnail: bannedUser.user.avatarURL(),
				footer: {
					text: `Reason: ${reason}`,
					iconURL: message.guild.iconURL(),
				},
			})
			await banMsg.edit(embed)
		} else {
			await banMsg.edit(
				"Uhh.. The person you were trying to ban wasn't found on this server"
			)
		}
	}
}
