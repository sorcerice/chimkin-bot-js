const { Message } = require('discord.js')
const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
	messageID: { type: String, required: true },
	emojiRoleMappings: { type: mongoose.Schema.Types.Mixed },
})

const MessageModel = (module.exports = mongoose.model('message', MessageSchema))
