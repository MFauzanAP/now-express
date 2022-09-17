const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
console.log(clientId)

const commands = [
	new SlashCommandBuilder().setName('unlock').setDescription('Unlocks a phase from the given code'),
	new SlashCommandBuilder().setName('approve').setDescription('Approves a participant\'s work for a phase and increments his progress'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);