const client = require('./Djs')
const users = require('./Users');
const { PermissionFlagsBits } = require('discord.js');

client.once('ready', async () => {
    console.log('Bot is now ready');
});



client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    console.log(interaction.user.username + " ran the command: " + commandName)
    if (commandName === 'unlock') {
        interaction.reply("Please check your DM to enter the code from the website");
        const filter = (m) => true
        const message = await interaction.user.send("Enter the code key given from the event website:")
        const collector = message.channel.createMessageCollector({ filter, max: 1, time: 30000 })
        collector.on("collect", async m => {
            code = m.content
            if (users.channelUserExists(code)) {
                res = await users.verifyChannel(code, m.author.id)
                if(res){
                    p = 1
                    if(await users.getUserByChannelId(code).progress > 1)
                        p = 2
                    m.reply("Congratulations! you have unlocked phase " + p)
                } else {
                    m.reply("Invalid credentials!")
                }
            } else {
                m.reply("Code was not found: " + code)
            }

        });
        collector.on("end", async m => {
            if(m.size == 0){
                await interaction.user.send("You have run out of time! try running the command again.");
            }
        })

    }else if (commandName === "approve"){
        if(!interaction.memberPermissions.has(PermissionFlagsBits.Administrator,true)){
            await interaction.reply("nope! you don't have permission to run this command.")
            return
        }
        if(!users.channelUserExists(interaction.channelId)){
            await interaction.reply("This channel is not specified to a particular user participant!")
            return
        }
        if (!interaction.channelId){
            await interaction.reply("Something went wrong! Please try again")
            return
        }
        users.rankUser(interaction.channelId)
            .then(async (result) => {
                console.log(result);
                if(result){
                    console.log('noice');
                    await interaction.user.send("User was successfully ranked up!")
                    await interaction.reply("Congratulations you have completed this phase, please visit the website to get the code for the next phase!")
                }else{
                    console.log('not noice');
                    await interaction.reply("Congratulations you have completed all the phases!")
                    await interaction.user.send("User had maxed up his ranking game!")
                }
            });
        
    }
});

client.on('guildMemberAdd', async member => {
    await member.send("Hello welcome to the new QUCC game dev event discord server! to begin run /verify in the bot commands channel in the server!");
});

client.login(process.env.TOKEN);