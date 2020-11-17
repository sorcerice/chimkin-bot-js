const { MessageCollector } = require('discord.js')
const { Command } = require('discord.js-commando')

const emojiRegex = require('emoji-regex/RGI_Emoji')

require('dotenv').config()
const prefix = process.env.PREFIX

const MessageModel = require('../../database/models/message')

let msgCollectorFilter = (newMsg, originalMsg) =>
	newMsg.author.id === originalMsg.author.id

module.exports = class AddReactionsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'addreactions',
			group: 'rolereactions',
			memberName: 'addreactions',
			description:
				'Chimkin enables a message to listen to reactions for roles and prompts to add those reactions',
			clientPermissions: ['MANAGE_ROLES'],
			userPermissions: ['MANAGE_ROLES'],
			args: [
				{
					key: 'messageID',
					prompt:
						'Please provide a message ID.\nTo get a message ID enable developer mode in your discord.\nSupport - https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-',
					type: 'string',
				},
			],
			guildOnly: true,
		})
	}

	async run(message, { messageID }) {
		try {
			let fetchedMessage = await message.channel.messages.fetch(messageID)
			if (fetchedMessage) {
				let requestRolesMsg = await message.channel.send(
					'Please provide the emoji along with the role name in the following format:\n`emoji, role name\nAfter you are done type ?done`'
				)
				let collector = new MessageCollector(
					message.channel,
					msgCollectorFilter.bind(null, message)
				)

				let emojiRoleMappings = new Map()

				collector.on(
					'collect',
					msg => {
						if (msg.content.toLowerCase() === `${prefix}done`) {
							msg.channel
								.send(
									'I am done collecting the emojis and roles'
								)
								.then(msg => msg.delete({ timeout: 2500 }))
								.catch(err => console.log(err))
							requestRolesMsg.delete({ timeout: 2500 })
							collector.stop('Done command was issued!')
							return
						}
						let [emojiName, roleName] = msg.content.split(/,\s+/gi)

						if (!emojiName && !roleName) return

						let unicodeEmojiCheck = emojiName.match(emojiRegex())
						let emoji
						if (unicodeEmojiCheck !== null) {
							emoji = unicodeEmojiCheck[0]
						} else {
							emoji = msg.guild.emojis.cache.find(
								emoji =>
									emoji.name.toLowerCase() ===
									emojiName.match(/\w+/gi)[0].toLowerCase()
							)
						}
						if (!emoji) {
							message.channel
								.send(
									'That emoji does not exist in this server. Try again!'
								)
								.then(msg => msg.delete({ timeout: 2500 }))
								.catch(err => console.log(err))
							return
						}

						let role = msg.guild.roles.cache.find(
							role =>
								role.name.toLowerCase() ===
								roleName.toLowerCase()
						)
						if (!role) {
							message.channel
								.send('That role does not exist. Try again!')
								.then(msg => msg.delete({ timeout: 2500 }))
								.catch(err => console.log(err))
							return
						}

						if (emoji && role) {
							fetchedMessage
								.react(emoji)
								.then(emoji => console.log('Reacted'))
								.catch(err => console.log(err))
							emojiRoleMappings.set(emoji.id || emoji, role.id)
						}
					},
					requestRolesMsg
				)
				collector.on('end', async (collected, reason) => {
					let findMsgDocument = await MessageModel.findOne({
						messageID: fetchedMessage.id,
					})

					if (findMsgDocument) {
						console.log("The message exists... don't save")
						message.channel
							.send(
								'That message is already setup for reactions roles'
							)
							.then(msg => msg.delete({ timeout: 2500 }))
							.catch(err => console.log(err))
					} else {
						let dbMsgModel = new MessageModel({
							messageID: fetchedMessage.id,
							emojiRoleMappings: emojiRoleMappings,
						})
						dbMsgModel
							.save()
							.then(m => console.log(m))
							.catch(err => console.log(err))
					}
				})
			}
		} catch (err) {
			let errMsg = await message.channel.send(
				'`Invalid ID: Message not found`'
			)
			errMsg.delete({ timeout: 5000 }).catch(err => console.log(err))
		}
	}
}
