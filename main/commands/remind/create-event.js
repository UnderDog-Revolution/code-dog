const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_event')
        .setDescription('Creates an event and optionally creates or uses an existing role.')
        .addStringOption(option =>
            option.setName('importance')
                .setDescription('Importance level (상, 중, 하)')
                .setRequired(true)
                .addChoices(
                    { name: '상', value: 'high' },
                    { name: '중', value: 'medium' },
                    { name: '하', value: 'low' },
                ))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Event name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('datetime')
                .setDescription('Date and time in ISO 8601 format (e.g., 2024-11-22T14:30:00)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role_name')
                .setDescription('Name of the role to use or create.')
                .setRequired(true)),
    async execute(interaction) {
        const importance = interaction.options.getString('importance');
        const name = interaction.options.getString('name');
        const datetime = interaction.options.getString('datetime');
        const roleName = interaction.options.getString('role_name');
        const guild = interaction.guild;

        const date = new Date(datetime);
        if (isNaN(date.getTime())) {
            return interaction.reply('Invalid datetime format. Please use ISO 8601 format (e.g., 2024-11-22T14:30:00).');
        }

        let roleId = null;

        const existingRole = await guild.roles.fetch().then(roles =>
            roles.find(role => role.name === roleName)
        );
        if (existingRole) {
            roleId = existingRole.id;
            interaction.channel.send(`Using existing role: <@&${roleId}>`);
        } else {
            try {
                const newRole = await guild.roles.create({
                    name: roleName,
                    color: 0x3498db,
                    reason: `Role created for event: ${name}`,
                });
                roleId = newRole.id;
                interaction.channel.send(`Role "${roleName}" has been created for this event.`);
            } catch (error) {
                console.error('Failed to create role:', error.message);
                return interaction.reply('Failed to create the role. Please check my permissions.');
            }
        }

        db.run(
            `INSERT INTO events (importance, name, datetime, roles) VALUES (?, ?, ?, ?)`,
            [importance, name, datetime, roleId],
            function (err) {
                if (err) {
                    console.error('Failed to create event:', err.message);
                    return interaction.reply('Failed to create event due to a database error.');
                }
                interaction.reply(`Event created: ${name} with importance ${importance} on ${datetime} for role <@&${roleId}>.`);
            }
        );
    },
};