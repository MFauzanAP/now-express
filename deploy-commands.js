const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');
console.log(clientId)

const commands = [
	new SlashCommandBuilder().setName('verify').setDescription('Verifies the user\'s account and enables phases.'),
	new SlashCommandBuilder().setName('rankup').setDescription('ranks up the participant and marks his phase as complete!'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);