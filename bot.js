require('dotenv').config()
const path = require('path')

// const database = require('./database/database')
const MessageModel = require('./database/models/message')

const Commando = require('discord.js-commando')
const { ReactionCollector, ReactionUserManager } = require('discord.js')
const message = require('./database/models/message')

const cachedMessageReactions = new Map()

const client = new Commando.CommandoClient({
	owner: '611941774373683210',
	commandPrefix: process.env.PREFIX,
	invite: 'https://discord.gg/ybCxREBBBr',
	partials: ['MESSAGE', 'REACTION'],
})

client.registry
	.registerGroups([
		['mod', 'mod commands'],
		['misc', 'misc commands'],
		['fun', 'fun commands'],
		['rolereactions', ' role reaction commands'],
	])
	.registerDefaultTypes()
	.registerDefaultGroups()
	.registerDefaultCommands({
		unknownCommand: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', () => {
	console.log(`${client.user.tag} is now online!`)

	// database
	// 	.then(() => console.log('Connected to mongoDB'))
	// 	.catch(err => console.log(err))
})

client.on('messageReactionAdd', async (reaction, user) => {
	let addMemberRole = emojiRoleMappings => {
		if (
			emojiRoleMappings.hasOwnProperty(
				reaction.emoji.id || reaction.emoji.name
			)
		) {
			let roleID =
				emojiRoleMappings[reaction.emoji.id || reaction.emoji.name]
			let role = reaction.message.guild.roles.cache.get(roleID)
			let member = reaction.message.guild.members.cache.get(user.id)
			if (role && member) {
				member.roles.add(role)
			}
		}
	}
	if (reaction.message.partial) {
		await reaction.message.fetch()
		let { id } = reaction.message
		try {
			let msgDocument = await MessageModel.findOne({ messageID: id })
			if (msgDocument) {
				let { emojiRoleMappings } = msgDocument
				cachedMessageReactions.set(id, msgDocument.emojiRoleMappings)
				addMemberRole(emojiRoleMappings)
			}
		} catch (err) {
			console.log(err)
		}
	} else {
		let emojiRoleMappings = cachedMessageReactions.get(reaction.message.id)
		addMemberRole(emojiRoleMappings)
	}
})

client.on('messageReactionRemove', async (reaction, user) => {
	let removeMemberRole = emojiRoleMappings => {
		if (
			emojiRoleMappings.hasOwnProperty(
				reaction.emoji.id || reaction.emoji.name
			)
		) {
			let roleID =
				emojiRoleMappings[reaction.emoji.id || reaction.emoji.name]
			let role = reaction.message.guild.roles.cache.get(roleID)
			let member = reaction.message.guild.members.cache.get(user.id)
			if (role && member) {
				member.roles.remove(role)
			}
		}
	}
	if (reaction.message.partial) {
		await message.channel.fetch()
		let { id } = reaction.message
		try {
			let msgDocument = await MessageModel.findOne({ messageID: id })
			if (msgDocument) {
				cachedMessageReactions.set(id, msgDocument.emojiRoleMappings)
				let { emojiRoleMappings } = msgDocument
				removeMemberRole(emojiRoleMappings)
			}
		} catch (err) {
			console.log(err)
		}
	} else {
		let emojiRoleMappings = cachedMessageReactions.get(reaction.message.id)
		removeMemberRole(emojiRoleMappings)
	}
})

client.on('msgDocFetched', msgModel => {
	cachedMessageReactions.set(msgModel.messageID, msgModel.emojiRoleMappings)
})

client.login(process.env.BOT_TOKEN)
