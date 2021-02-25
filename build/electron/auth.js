const axios = require("axios");
const url = require("url");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bot_token = "NzcwMjI5MDY1OTYwNjUyODAy.X5ahtw.f3Qvw2lPOXo9968jeiIp9XjfteI";
const client_id = "770229065960652802";
const client_secret = "tKoj34CX6INQP8yDrO78KorUPF_fE0XB";
const guildId = "770899332235919381";
// const bot_token = "ODExMjY5MTg5MzE3ODIwNDQ3.YCvvTw.W3qMkkMnVGMOrHpCpTBKIbY_t7M";
// const client_id = "811269189317820447";
// const client_secret = "kya-iVDARcSe9EbGWzUdg83XW58rMiml";
// const guildId = "801413608621867058";
const redirect_uri = "http://localhost/callback/*";
let accessToken = null;
function getAccessToken() {
    return accessToken;
}
function getAuthenticationURL() {
    return `https://discord.com/api/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=identify%20email`;
}

async function loadTokens(callbackURL) {
    const urlParts = url.parse(callbackURL, true);
    const query = urlParts.query;
    const payload = new URLSearchParams();
    payload.append("client_id", client_id);
    payload.append("client_secret", client_secret);
    payload.append("grant_type", "authorization_code");
    payload.append("redirect_uri", redirect_uri);
    payload.append("code", query.code);
    payload.append(
        "scope",
        "identify guilds guilds.join gdm.join rpc email connections"
    );
    const options = {
        method: "POST",
        url: "https://discord.com/api/oauth2/token",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        data: payload,
    };
    const response = await axios(options);
    accessToken = response.data.access_token;
}
let user = null;

function getCurrentUser() {
    if (user) {
        return jwt.sign(user, "123Jwt");
    }
    return user;
}

function logout() {
    user = null;
}
async function login() {
    let options = {
        method: "GET",
        url: "https://discordapp.com/api/users/@me",
        headers: {
            Authorization: `Bearer ${getAccessToken()}`,
        },
    };
    let res = await axios(options);
    const userData = res.data;
    options = {
        method: "GET",
        url: `https://discordapp.com/api/guilds/${guildId}/members/${userData.id}`,
        headers: {
            Authorization: `Bot ${bot_token}`,
        },
    };
    res = await axios(options);
    const roles_id = res.data.roles;
    userData.joined_at = res.data.joined_at;
    // if (!roles_id.includes("790476295653294090")) {
    //     throw new Error("Not Allowed to login");
    // }
    options = {
        method: "GET",
        url: `https://discordapp.com/api/guilds/${guildId}/roles`,
        headers: {
            Authorization: `Bot ${bot_token}`,
        },
    };
    res = await axios(options);
    const roles = [];
    for (const role of res.data) {
        if (roles_id.includes(role.id)) {
            roles.push(role.name);
        }
    }
    userData.roles = roles;
    userData.avatar = userData.avatar
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png";
    user = userData;
}

module.exports = {
    getAccessToken,
    getAuthenticationURL,
    loadTokens,
    login,
    getCurrentUser,
    logout,
};
