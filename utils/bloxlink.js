
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const log = require("./Logs.js");

async function bloxlink(userId) {
    const serverId = process.env.GUILD_ID;
    const apiKey = process.env.BLOXLINK_API_KEY;

    if (!serverId || !apiKey) {
        throw new Error("Missing Bloxlink environment variables.");
    }

    const response = await fetch(
        `https://api.blox.link/v4/public/guilds/${serverId}/discord-to-roblox/${userId}`,
        {
            method: "GET",
            headers: {
                Authorization: apiKey
            }
        }
    );

    if (!response.ok) {
        log.error(`Bloxlink API returned HTTP ${response.status}`);
        throw new Error(`Bloxlink API error: ${response.status}`);
    }

    const json = await response.json();

    log.info(`Bloxlink lookup completed for Discord user ${userId}`);

    return json.robloxID || "not_linked";
}

async function getUsernameById(robloxId) {
    const response = await fetch(
        `https://users.roblox.com/v1/users/${encodeURIComponent(robloxId)}`
    );

    if (!response.ok) {
        log.error(`Roblox API returned HTTP ${response.status}`);
        throw new Error(`Roblox API error: ${response.status}`);
    }

    const json = await response.json();

    return json.name || null;
}

module.exports = {
    bloxlink,
    getUsernameById
};
