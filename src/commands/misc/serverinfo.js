const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')

module.exports = class ServerInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'serverinfo',
			aliases: ['servinfo', 'si'],
			group: 'misc',
			memberName: 'serverinfo',
			description: "Chimkin displays this server's information",
			guildOnly: true,
		})
	}

	async run(message) {
		const { guild } = message
		const {
			name,
			owner,
			region,
			memberCount,
			createdAt,
			premiumTier,
			premiumSubscriptionCount,
		} = guild
		const { author } = message
		const icon = guild.iconURL()

		let premium
		if (premiumTier === 0) {
			premium = 'Not Boosted'
		} else if (premiumTier === 1) {
			premium = 'Tier 1'
		} else if (premiumTier === 2) {
			premium = 'Tier 2'
		} else if (premiumTier === 3) {
			premium = 'Tier 3'
		}

		const embed = new MessageEmbed({
			title: `**${name}** info`,
			author: {
				name: author.username,
				iconURL: author.avatarURL(),
			},
			description: `Owned by ${owner.user.tag}`,
			thumbnail: {
				url: icon,
			},
			fields: [
				{
					name: 'Server Region:',
					value: region,
					inline: true,
				},
				{
					name: 'Member Count',
					value: memberCount,
					inline: true,
				},
				{
					name: 'Boost Tier',
					value: premium,
					inline: false,
				},
				{
					name: 'Boosts',
					value: premiumSubscriptionCount,
					inline: true,
				},
			],
			footer: {
				text: `Created At: ${createdAt}`,
				iconURL: icon,
			},
		})

		await message.channel.send(embed)
	}
}
