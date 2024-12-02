const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { scheduledJobs } = require('../../reminder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_event')
        .setDescription('Deletes an event by its ID.')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the event to delete.')
                .setRequired(true)),
    async execute(interaction) {
        const eventId = interaction.options.getInteger('id');

        try {
            db.run(`DELETE FROM events WHERE id = ?`, [eventId], function (err) {
                if (err) {
                    console.error(`Failed to delete event ID ${eventId}:`, err.message);
                    return interaction.reply('Failed to delete the event due to a database error.');
                }

                console.log(`Deleting event with ID: ${eventId}`);
                if (scheduledJobs[eventId]) {
                    scheduledJobs[eventId].forEach((job, index) => {
                        if (job) {
                            job.cancel();
                            console.log(`Cancelled job ${index + 1} for event ID ${eventId}`);
                        } else {
                            console.warn(`Job ${index + 1} for event ID ${eventId} is null.`);
                        }
                    });
                    delete scheduledJobs[eventId];
                    console.log(`All jobs for event ID ${eventId} have been removed.`);
                } else {
                    console.log(`No scheduled jobs found for event ID ${eventId}.`);
                }

                interaction.reply(`Successfully deleted the event with ID ${eventId}.`);
            });
        } catch (error) {
            console.error('Unexpected error during event deletion:', error.message);
            interaction.reply('An unexpected error occurred while deleting the event.');
        }
    },
};