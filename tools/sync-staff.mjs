#!/usr/bin/env node
// Reads the staff of the Discord server and writes data/staff.json for staff.html.
//
// Runs in GitHub Actions (.github/workflows/sync-staff.yml) with the bot token in the
// DISCORD_BOT_TOKEN secret. The bot must be in the server and have the Server Members
// intent turned on in the Discord developer portal, or the member list comes back empty.
//
// Which roles count as staff, and in which order they are shown, is set in
// staff.config.json: role names or role IDs, highest first.
//
//   DISCORD_BOT_TOKEN=... node tools/sync-staff.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const API = 'https://discord.com/api/v10';
const token = process.env.DISCORD_BOT_TOKEN;
const config = JSON.parse(await readFile(new URL('../staff.config.json', import.meta.url), 'utf8'));
const out = new URL('../data/staff.json', import.meta.url);

if (!config.guildId) {
  console.log('sync-staff: guildId is empty in staff.config.json, nothing to sync yet.');
  process.exit(0);
}
if (!token) fail('DISCORD_BOT_TOKEN is not set. Add it under Settings > Secrets and variables > Actions.');
if (!config.roles?.length) fail('No staff roles listed in staff.config.json.');

async function api(path) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(API + path, { headers: { Authorization: `Bot ${token}`, 'User-Agent': 'StudioDerivaSite (https://studio-deriva.github.io, 1.0)' } });
    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      await new Promise((r) => setTimeout(r, Math.ceil((body.retry_after ?? 1) * 1000)));
      continue;
    }
    if (!res.ok) fail(`Discord answered ${res.status} for ${path}: ${await res.text()}`);
    return res.json();
  }
  fail(`Rate limited too many times on ${path}`);
}

function fail(message) {
  console.error('sync-staff: ' + message);
  process.exit(1);
}

function avatarUrl(guildId, member) {
  const user = member.user;
  if (member.avatar) {
    const ext = member.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/guilds/${guildId}/users/${user.id}/avatars/${member.avatar}.${ext}?size=256`;
  }
  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
  }
  return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;
}

const guildId = config.guildId;
const allRoles = await api(`/guilds/${guildId}/roles`);

// Staff roles in the configured order; each entry may be a role name or a role ID.
const staffRoles = config.roles.map((key) => {
  const role = allRoles.find((r) => r.id === String(key)) ?? allRoles.find((r) => r.name.toLowerCase() === String(key).toLowerCase());
  if (!role) console.warn(`sync-staff: no role called or numbered "${key}" in the server, skipped`);
  return role;
}).filter(Boolean);
const staffIds = new Set(staffRoles.map((r) => r.id));

// The member list, a thousand at a time.
const members = [];
let after = '0';
for (;;) {
  const page = await api(`/guilds/${guildId}/members?limit=1000&after=${after}`);
  members.push(...page);
  if (page.length < 1000) break;
  after = page[page.length - 1].user.id;
}

const hidden = new Set((config.hide ?? []).map(String));
const groups = staffRoles.map((role) => ({ role: { id: role.id, name: role.name, color: role.color }, members: [] }));

for (const member of members) {
  if (member.user.bot || hidden.has(member.user.id)) continue;
  const mine = staffRoles.filter((r) => member.roles.includes(r.id));
  if (!mine.length) continue;
  // Everyone appears once, under their highest staff role; the pills list all of them.
  const group = groups.find((g) => g.role.id === mine[0].id);
  group.members.push({
    id: member.user.id,
    name: member.nick || member.user.global_name || member.user.username,
    username: member.user.username,
    avatar: avatarUrl(guildId, member),
    roles: mine.map((r) => ({ name: r.name, color: r.color })),
  });
}
for (const g of groups) g.members.sort((a, b) => a.name.localeCompare(b.name));

// Keep the old timestamp when nothing changed, so the file only changes when the staff do.
let previous = null;
try { previous = JSON.parse(await readFile(out, 'utf8')); } catch {}
const same = previous && JSON.stringify(previous.groups) === JSON.stringify(groups);
const data = { updated: same ? previous.updated : new Date().toISOString(), groups };

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(out, JSON.stringify(data, null, 2) + '\n');
const count = groups.reduce((n, g) => n + g.members.length, 0);
console.log(`sync-staff: ${count} staff in ${groups.filter((g) => g.members.length).length} roles${same ? ' (unchanged)' : ''}`);
if (members.length <= 1) console.warn('sync-staff: only one member came back. Is the Server Members intent on for the bot?');
