const { Command } = require('discord.js-commando')
require('dotenv').config()
const prefix = process.env.PREFIX

module.exports = class UnbanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unban',
			group: 'mod',
			memberName: 'unban',
			description: 'Chimkin will unban this person',
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			guildOnly: true,
			args: [
				{
					key: 'userID',
					prompt: `I need the users ID. Use ${prefix}banned to get the id.`,
					type: 'string',
				},
				{
					key: 'reason',
					prompt: `You need to provide a reason for the unban.`,
					type: 'string',
					default: 'No reason provided',
				},
			],
		})
	}

	async run(message, { userID, reason }) {
		const { guild } = message
		if (userID.startsWith('<@!')) {
			message.say(
				`I need the user's ID. Use \`${prefix}banned\` to get the id.`
			)
		} else {
			const unbanMsg = await message.say('Unban process started....')
			await guild.members.unban(userID, reason)
			await unbanMsg.edit('Unban Complete')
		}
	}
}
