const {Client,Partials} = require('discord.js')
const client = new Client({ partials: [ Partials.Channel, Partials.Message, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 5635 })

module.exports = client