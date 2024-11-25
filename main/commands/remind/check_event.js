const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check_event')
        .setDescription('Displays the list of created events'),
    async execute(interaction) {
        db.all(`SELECT * FROM events`, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return interaction.reply('Failed to retrieve events due to a database error.');
            }

            if (rows.length === 0) {
                return interaction.reply('There are no events to display.');
            }

            let eventList = '**Current Events:**\n';
            rows.forEach((event) => {
                eventList += `\n**ID:** ${event.id}\n`;
                eventList += `**Name:** ${event.name}\n`;
                eventList += `**Importance:** ${event.importance}\n`;
                eventList += `**Date and Time:** ${event.datetime}\n`;
                eventList += `**Roles Involved:** ${event.roles ? `<@&${event.roles}>` : 'None'}\n`;
                eventList += `-------------------------\n`;
            });

            interaction.reply(eventList);
        });
    },
};
