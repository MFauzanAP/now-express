const jsonData = require('./data.json')
const keys = require('./keys.json')
const fs = require('fs')
const client = require("./Djs")
const { ChannelType, PermissionFlagsBits } = require('discord.js')
let users = jsonData.users;

if (!(jsonData.hasOwnProperty("users"))) {
    users = {};
}

async function addUser(userEmail, name) {
    if (isEmailRegistered(userEmail))
        return false;
    console.log("Registering user: " + userEmail)
    guild = client.guilds.cache.get(process.env.GUILD_ID)
    users[userEmail.toLowerCase()] = {
        "fullName": name,
        "email": userEmail.toLowerCase(),
        "discordId": "NaN",
        "discordChannelIds": [],
        "progress": 0
    };
    await createChannel("phase-one", guild, "Welcome to Phase One!", name, userEmail)
    await createChannel("phase-two", guild, "Congratulations! You have successfully reached the second and last phase of the event.", name, userEmail)
    fs.writeFileSync('keys.json', JSON.stringify(keys));
    fs.writeFileSync('data.json', JSON.stringify({ "users": users }));
    return true
}

function addChannelUserEmailRelation(userEmail, channelId) {
    if (keys.hasOwnProperty(channelId)) 
        return false
    keys[channelId] = userEmail
    return true
}

async function verifyChannel(code,userId) {
    if(!channelUserExists(code))
        return false;
    let userEmail = keys[code]
    if(users[userEmail].progress >= 2){
        return false;
    }
    let user = users[userEmail]
    if(!code in user.discordChannelIds)
         return false
    guild = await client.guilds.cache.get(process.env.GUILD_ID)
    channel = await guild.channels.cache.get(code)
    await channel.permissionOverwrites.edit(userId, { ViewChannel: true });
    return true
}

async function createChannel(channel_name, guild, title, username, email) {
    await guild.channels.create({
        name: channel_name,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
        ],

    }).then(async function (channel) {
        await channel.send("This channel had been created for participant" + username + " with the email: " + email)
        await channel.send({
            embeds: [{
                color: 0xFFCE30,
                title: title,
                description: "Instruction\n don't talk about this channel",
                author: {
                    name: 'Einstein',
                    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg',
                    url: 'https://qu.edu.qa',
                },
                thumbnail: {
                    url: 'https://media.discordapp.net/attachments/1020028524641398886/1020033438268526693/2920b8ae-61a5-4d0f-96b8-773f8d296c7d_CWC___Week_1.png?width=1870&height=1051',
                },
                footer: {
                    text: "QUCC GAME DEV"
                }
            }]
        })
        users[email].discordChannelIds.push(channel.id);
        addChannelUserEmailRelation(email, channel.id);
    })
}

function rankUser(code){
    let user = getUserByChannelId(code)
    progress = user.progress
    console.log(progress);
    if(progress <= 1){
        users[user.email].progress += 1;
        fs.writeFileSync('data.json', JSON.stringify({ "users": users }));
        return true
    }
    return false;
}
function getUserData(userEmail) {
    return users[userEmail];
}

function getUserByChannelId(channelId) {
    return users[keys[channelId]]
}

function isEmailRegistered(email) {
    return users.hasOwnProperty(email.toLowerCase());
}

function channelUserExists(code) {
    return code in keys
}

module.exports = {
    isEmailRegistered,
    addUser,
    getUserData,
    verifyChannel,
    channelUserExists,
    getUserByChannelId,
    rankUser
};