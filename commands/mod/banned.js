const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
require('dotenv').config()
module.exports = class Banned extends Command {
	constructor(client) {
		super(client, {
			name: 'banned',
			group: 'mod',
			memberName: 'banned',
			description: 'Chimkin provides a banned user list',
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			guildOnly: true,
		})
	}

	async run(message) {
		const bannedUsers = await message.guild.fetchBans()
		const bannedUsersArray = bannedUsers.array()

		const embed = new MessageEmbed({
			title: `Banned Users in ${message.guild.name}`,
			thumbnail: {
				url: message.guild.iconURL(),
			},
			footer: {
				text: `You can unban these users by the ${process.env.PREFIX}unban command`,
				iconURL: message.guild.iconURL(),
			},
		})

		if (bannedUsersArray.length >= 1) {
			for (
				let i = bannedUsersArray.length;
				i <= bannedUsersArray.length;
				i++
			) {
				embed.addField(
					`${bannedUsersArray[i - 1].user.tag} || ID: ${
						bannedUsersArray[i - 1].user.id
					}`,
					`Reason: ${bannedUsersArray[i - 1].reason}`
				)
			}
		} else {
			embed.setDescription('No banned users were found!')
		}

		await message.channel.send(embed)
	}
}
