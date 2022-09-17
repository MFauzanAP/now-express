const {s3} = require('./aws');
const client = require("./Djs")
const { ChannelType, PermissionFlagsBits } = require('discord.js')

async function addUser(userEmail, name) {
    if (await isEmailRegistered(userEmail))
        return false;
    console.log("Registering user: " + userEmail)
    guild = client.guilds.cache.get(process.env.GUILD_ID)
    let users = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'data.json'
    }).promise()).Body.toString()).users;
    let keys = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'keys.json'
    }).promise()).Body.toString());
    users[userEmail.toLowerCase()] = {
        "fullName": name,
        "email": userEmail.toLowerCase(),
        "discordId": "NaN",
        "discordChannelIds": [],
        "progress": 0
    };
    await s3.putObject({
        Key: 'keys.json',
        Bucket: process.env.AWS_BUCKET,
        Body: JSON.stringify(keys),
    }).promise();
    await s3.putObject({
        Key: 'data.json',
        Bucket: process.env.AWS_BUCKET,
        Body: JSON.stringify({ users: users }),
    }).promise();
    await createChannel("phase-one", guild, "Welcome to Phase One!", name, userEmail)
    await createChannel("phase-two", guild, "Congratulations! You have successfully reached the second and last phase of the event.", name, userEmail)
    return true
}

async function addChannelUserEmailRelation(userEmail, channelId) {
    let keys = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'keys.json'
    }).promise()).Body.toString());
    if (keys.hasOwnProperty(channelId)) 
        return false
    keys[channelId] = userEmail
    await s3.putObject({
        Key: 'keys.json',
        Bucket: process.env.AWS_BUCKET,
        Body: JSON.stringify(keys),
    }).promise();
    return true
}

async function verifyChannel(code,userId) {
    if(!channelUserExists(code))
        return false;
    let keys = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'keys.json'
    }).promise()).Body.toString());
    let userEmail = keys[code];
    let users = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'data.json'
    }).promise()).Body.toString()).users;
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
        let users = JSON.parse((await s3.getObject({
            Bucket: process.env.AWS_BUCKET,
            Key: 'data.json'
        }).promise()).Body.toString()).users;
        console.log(users);
        users[email].discordChannelIds.push(channel.id);
        await s3.putObject({
            Key: 'data.json',
            Bucket: process.env.AWS_BUCKET,
            Body: JSON.stringify({ users: users }),
        }).promise();
        addChannelUserEmailRelation(email, channel.id);
    })
}

async function rankUser(code){
    let user = getUserByChannelId(code)
    progress = user.progress
    console.log(progress);
    if(progress <= 1){
        let users = JSON.parse((await s3.getObject({
            Bucket: process.env.AWS_BUCKET,
            Key: 'data.json'
        }).promise()).Body.toString()).users;
        users[user.email].progress += 1;
        await s3.putObject({
            Key: 'data.json',
            Bucket: process.env.AWS_BUCKET,
            Body: JSON.stringify({ "users": users }),
        }).promise();
        return true
    }
    return false;
}
async function getUserData(userEmail) {
    let users = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'data.json'
    }).promise()).Body.toString()).users;
    return users[userEmail];
}

async function getUserByChannelId(channelId) {
    let keys = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'keys.json'
    }).promise()).Body.toString());
    let users = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'data.json'
    }).promise()).Body.toString()).users;
    return users[keys[channelId]]
}

async function isEmailRegistered(email) {
    let users = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'data.json'
    }).promise()).Body.toString()).users;
    return users.hasOwnProperty(email.toLowerCase());
}

async function channelUserExists(code) {
    let keys = JSON.parse((await s3.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: 'keys.json'
    }).promise()).Body.toString());
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