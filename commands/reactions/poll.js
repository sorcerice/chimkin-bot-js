const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const emojiRegex = require('emoji-regex/RGI_Emoji')
const { get } = require('mongoose')
require('dotenv').config()

const prefix = process.env.PREFIX

function durationToTime(duration) {
	let d, h, m, s
	s = Math.floor(duration / 1000)
	m = Math.floor(s / 60)
	s = s % 60
	h = Math.floor(m / 60)
	m = m % 60
	d = Math.floor(h / 24)
	h = h % 24

	s < 10 ? (s = `0${s}`) : (s = `${s}`)
	m < 10 ? (m = `0${m}`) : (m = `${m}`)
	h < 10 ? (h = `0${h}`) : (h = `${h}`)
	d < 10 ? (d = `0${d}`) : (d = `${d}`)

	return `${d} days : ${h}hrs : ${m}mins : ${s}secs`
}

module.exports = class CreatePollCommand extends (
	Command
) {
	constructor(client) {
		super(client, {
			name: 'createpoll',
			aliases: ['mkpoll', 'makepoll'],
			group: 'reactions',
			memberName: 'createpoll',
			description:
				'Create a poll for people to vote using reactions. Currently limited to support only 10 options.',
			clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES'],
			args: [
				{
					key: 'time',
					prompt:
						'I need you to tell me after how long the poll ends\n`d=days, h=hours, m=minutes, s=seconds`\neg: `2d2h5m6s` = 2days 2hours 5minutes 6seconds',
					type: 'string',
					error: 'Check the time format and try again.',
				},
				{
					key: 'question',
					prompt:
						"What is the question for the poll? (Surround the question in single quotes)\nEx: `'Question here'`",
					type: 'string',
				},
				{
					key: 'reactions',
					prompt:
						"Type the reaction followed by the option it corresponds to in the following format\n`'<emote1> [option 1], <emote 2> [option 2], etc.'`\n`Ex: ':joy: [Cats], :pepelaugh: [Dogs]''`\n(Single quotes are needed)",
					type: 'string',
					error:
						'Looks like something went wrong.\nCheck the format for the reactions and try again.',
					wait: 120,
				},
				{
					key: 'pollChannel',
					prompt:
						'Please provide the name of the channel this poll has to be posted in.\n(If there are two channels with the same name use the channel ID instead.\nID - https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-',
					type: 'string',
				},
			],
			argsSingleQuotes: true,
			guildOnly: true,
		})
	}

	async run(message, { time, question, reactions, pollChannel }) {
		let timeArray = time.match(/(?:\d*[d|h|m|s])/gi)
		let [day, hour, minute, second] = [0, 0, 0, 0]

		timeArray.find(timeValUnit => {
			if (timeValUnit.match(/\d*[d]/gi)) {
				day = timeValUnit.match(/\d*[d]/gi)[0].match(/\d*/gi)[0]
			} else if (timeValUnit.match(/\d*[h]/gi)) {
				hour = timeValUnit.match(/\d*[h]/gi)[0].match(/\d*/gi)[0]
			} else if (timeValUnit.match(/\d*[m]/gi)) {
				minute = timeValUnit.match(/\d*[m]/gi)[0].match(/\d*/gi)[0]
			} else if (timeValUnit.match(/\d*[s]/gi)) {
				second = timeValUnit.match(/\d*[s]/gi)[0].match(/\d*/gi)[0]
			}
		})

		let pollDuration =
			day * 86400000 + hour * 3600000 + minute * 60000 + second * 1000

		let reactionOptionArray = reactions.split(/,\s+/)

		let reactionArray = []
		let optionArray = []

		reactionOptionArray.find(reactOption => {
			let reaction = reactOption.split(/\s+/gi)[0]
			let option = reactOption.split(/\s+/gi)[1]
			reactionArray.push(reaction)
			optionArray.push(option)
		})

		let descText =
			'Click the reaction corresponding the option to submit your vote for the poll\nNote: If you wish to change your vote, remove your previous vote before reacting to a new option or your vote will be locked in.'
		let gifURL = 'https://media.giphy.com/media/26xBCJ7abE7ZCvyow/giphy.gif'
		let footerText = `Poll ends in ${durationToTime(
			pollDuration
		)}\nThe poll can be stopped at anytime when the poll author reacts to the ❌ emoji`

		const pollEmbed = new MessageEmbed({
			title: question,
			thumbnail: {
				url: gifURL,
			},
			author: {
				name: message.author.username,
				iconURL: message.author.avatarURL(),
			},
			description: descText,
			footer: {
				text: footerText,
				iconURL: message.guild.iconURL(),
			},
		})

		reactionOptionArray.forEach(reactionOption => {
			let separatedReactionOption = reactionOption.replace(
				reactionOption.match(/\s+/g)[0],
				' = '
			)
			pollEmbed.addField(separatedReactionOption, '\u200B', false)
		})

		let pollChannelID = pollChannel.match(/\d{18}/g)

		let unicodeEmojis = []
		let guildEmojis = []

		reactionArray.forEach(reaction => {
			let unicodeEmojiCheck = reaction.match(emojiRegex())
			if (unicodeEmojiCheck) {
				unicodeEmojis.push(unicodeEmojiCheck[0])
			}
		})

		reactionArray.forEach(reaction => {
			let guildEmojiCheck = reaction.match(/\d{18}/g)
			if (guildEmojiCheck) {
				let guildEmoji = message.guild.emojis.cache.find(
					emoji => emoji.id === guildEmojiCheck[0]
				)
				guildEmojis.push(guildEmoji)
			}
		})

		if (pollChannelID) {
			if ((reactionArray.length && optionArray.length) <= 12) {
				let pollMsg = await message.guild.channels.cache
					.get(pollChannelID[0])
					.send(pollEmbed)

				try {
					if (unicodeEmojis.length != 0) {
						unicodeEmojis.forEach(emoji => pollMsg.react(emoji))
					}
					if (guildEmojis.length != 0) {
						guildEmojis.forEach(emoji => pollMsg.react(emoji))
					}
					pollMsg.react('❌')
				} catch (error) {
					console.log(error)
					message.reply(
						"One of the reactions provided wasn't in this server"
					)
				}

				let reactedUserIds = []

				const reactionCollector = pollMsg.createReactionCollector(
					(reaction, user) => {
						if (user.bot) return false
						if (
							reaction.emoji.name === '❌' &&
							user.id === message.author.id
						)
							return true
						if (
							reactedUserIds.some(
								reactedId => reactedId === user.id
							)
						)
							return false
						if (
							unicodeEmojis.some(
								emoji => emoji === reaction.emoji.name
							)
						)
							return true
						if (
							guildEmojis.some(
								emoji => emoji.name === reaction.emoji.name
							)
						)
							return true
					},
					{ time: pollDuration, dispose: true }
				)

				reactionCollector.on('collect', (reaction, user) => {
					reactedUserIds.push(user.id)
					if (
						reaction.emoji.name === '❌' &&
						user.id === message.author.id
					)
						reactionCollector.stop()
				})

				reactionCollector.on('remove', (reaction, user) => {
					reactedUserIds.splice(reactedUserIds.indexOf(user.id), 1)
					reaction.users.cache.delete(user.id)
				})

				reactionCollector.on('end', collectedReactions => {
					collectedReactions.delete('❌')
					reactionOptionArray.forEach(reactionOption => {
						let reaction = reactionOption.split(/\s+/g)[0]
						let option = reactionOption.match(/\s+.+/g)[0]
						if (reaction.match(emojiRegex())) {
							let reactionID = reaction.match(emojiRegex())[0]
							if (collectedReactions.has(reactionID)) {
								collectedReactions.forEach(reaction => {
									if (reaction.emoji.name === reactionID) {
										reaction.option = option
										reaction.voteCount =
											reaction.users.cache.size - 1
									}
								})
							}
						} else if (reaction.match(/\d{18}/g)) {
							let reactionID = reaction.match(/\d{18}/g)[0]
							if (collectedReactions.has(reactionID)) {
								collectedReactions.forEach(reaction => {
									if (reaction.emoji.id === reactionID) {
										reaction.option = option
										reaction.voteCount =
											reaction.users.cache.size - 1
									}
								})
							}
						}
					})

					const date = new Date()

					const getPollWinner = collectedReactions => {
						let voteCountArray = []
						collectedReactions.forEach(reaction =>
							voteCountArray.push(reaction.voteCount)
						)

						if (voteCountArray.length === 0) {
							return 'It seems like this poll was absolutely useless and not a living soul on this server has voted.\n **Thanks for wasting my time!**\n\nSincerely,\n**Chimkin**'
						} else {
							let winningVoteCount = voteCountArray.reduce(
								(a, b) => {
									return Math.max(a, b)
								}
							)
							let winningVote = collectedReactions.filter(
								reaction =>
									reaction.voteCount === winningVoteCount
							)

							if (winningVote.size === 1) {
								let winningEmojiOption = []

								winningVote.forEach(reaction => {
									if (reaction.emoji.id) {
										winningEmojiOption.push(
											`<:${reaction.emoji.name}:${reaction.emoji.id} -> ${reaction.option}`
										)
									} else {
										winningEmojiOption.push(
											`${reaction.emoji.name} -> ${reaction.option}`
										)
									}
								})

								return `The poll has ended!\nThe winning option was **${winningEmojiOption[0]}** with **${winningVoteCount}** vote/s`
							} else {
								let winningEmojiOptions = []
								winningVote.forEach(reaction => {
									if (reaction.emoji.id) {
										winningEmojiOptions.push(
											`<:${reaction.emoji.name}:${reaction.emoji.id} -> ${reaction.option}`
										)
									} else {
										winningEmojiOptions.push(
											`${reaction.emoji.name} -> ${reaction.option}`
										)
									}
								})

								const tieBreaker = winningEmojiOptions => {
									return winningEmojiOptions[
										Math.floor(
											Math.random() *
												Math.floor(
													winningEmojiOptions.length
												)
										)
									]
								}

								return `The poll has ended!\nThere was a tie between \n\n**${winningEmojiOptions.join(
									'\n'
								)}**\nwith **${winningVoteCount}** vote/s\n\n*Chimkin tie breaker chooses:* \n**${tieBreaker(
									winningEmojiOptions
								)}**\n*as the winner*`
							}
						}
					}

					const pollResultsEmbed = new MessageEmbed({
						title: question,
						thumbnail: {
							url: gifURL,
						},
						author: {
							name: message.author.name,
							iconURL: message.author.avatarURL(),
						},
						description: getPollWinner(collectedReactions),
						footer: {
							text: `Poll ended on ${date.toUTCString()}`,
							iconURL: message.guild.iconURL(),
						},
					})

					pollMsg.edit(pollResultsEmbed)
				})
			} else {
				message.channel.send(
					'You cannot have more that 12 options for the poll.'
				)
			}
		} else {
			message.channel.send('The mentioned channel does not exist')
		}
	}
}
