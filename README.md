# GoatBot-style Framework

Node.js command framework with levels, XP, tiers, scores, leaderboard, daily points, games, fun commands, owner controls, and a Render-compatible health endpoint.

**Important:** This is not an Instagram adapter. It does not log in, read group DMs, send DMs, or tag members. Official Instagram APIs do not provide general access to ordinary group-DM automation. Never paste passwords or session cookies into this project.

## Render
Runtime: Node
Build command: `npm install`
Start command: `npm start`
Health endpoint: `/health`

## Local
Node.js 18+, then `npm install` and `npm start`.

## Commands
`!help`, `!ping`, `!rank`, `!profile`, `!level`, `!score`, `!leaderboard`, `!top`, `!daily`, `!joke`, `!quote`, `!fact`, `!8ball`, `!trivia`, `!answer`, `!rps rock|paper|scissors`, `!ship <name>`, `!setmsg <key> <message>`, `!msg <key>`, `!setprefix <prefix>`, `!setlevel <userId> <level>`, `!resetlevel <userId>`.

## Tiers
Bronze 1–10, Silver 11–25, Gold 26–50, Diamond 51–75, Master 76–99, Legendary 100+.
XP cooldown defaults to 45 seconds; level-ups grant 25 points; daily bonus defaults to 100 points.

`bot.js` exports `runCommand({senderId, senderName, text, targetId, targetName})` for a future supported chat adapter.
