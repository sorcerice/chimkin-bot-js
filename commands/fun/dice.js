const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

module.exports = class DiceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dice',
			aliases: ['roll', 'rolldice'],
			group: 'fun',
			memberName: 'roll',
			description: 'Chimkin rolls dice in his play area',
			args: [
				{
					key: 'sides',
					prompt: 'How many sides does the die have?',
					type: 'integer',
					max: 20,
					min: 3,
					// default: 6,
				},
				{
					key: 'rolls',
					prompt: 'How many times do you want to roll the die?',
					type: 'integer',
					max: 100,
					min: 1,
					// default: 1,
				},
			],
		})
	}

	async run(message, { sides, rolls }) {
		const rollDice = sides => Math.floor(Math.random() * sides) + 1

		const embed = new MessageEmbed({
			author: {
				name: message.author.username,
				iconURL: message.author.avatarURL(),
			},
			color: '#f28ad3',
			title: 'Dice Roll Command',
			description: `Rolling a ${sides} sided dice ${rolls} time/s......`,
			thumbnail: {
				url: 'https://i.gifer.com/PCI3.gif',
			},
			footer: {
				text: 'Chimkin wishes you luck with your RNG',
				iconURL: this.client.user.avatarURL(),
			},
		})

		let diceMsg = await message.channel.send(embed)

		let rollOutput = []

		const rollFunction = (sides, rolls) => {
			for (let i = 1; i <= rolls; i++) {
				rollOutput.push(rollDice(sides))
			}
		}

		rollFunction(sides, rolls)

		await diceMsg.edit(
			embed.addField(
				'You have rolled:',
				`${rollOutput.join(' + ')}`,
				false
			)
		)

		await diceMsg.edit(
			embed.addField(
				'Total',
				rollOutput.reduce((first, second) => first + second),
				false
			)
		)
	}
}
