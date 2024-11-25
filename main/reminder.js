const db = require('./database');
const schedule = require('node-schedule');
const { channel_notice } = require('./config.json');

const scheduledJobs = {};

module.exports = { scheduledJobs, scheduleReminders };

function scheduleReminders(client) {
    db.all("SELECT * FROM events", [], (err, rows) => {
        if (err) {
            console.error('Failed to retrieve events:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No events found.');
            return;
        }

        rows.forEach(event => {
            const eventDate = new Date(event.datetime);

            let notifyTimes = [];
            if (event.importance === 'high') {
                notifyTimes = [
                    new Date(eventDate.getTime() - 5 * 24 * 60 * 60 * 1000),
                    new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000),
                    new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000),
                    new Date(eventDate.getTime() - 12 * 60 * 1000)
                ];
            } else if (event.importance === 'medium') {
                notifyTimes = [
                    new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000),
                    new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000),
                ];
            } else if (event.importance === 'low') {
                notifyTimes = [
                    new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000)
                ];
            }

            // 알림 시간 처리
            notifyTimes.forEach((time, index) => {
                if (isNaN(time.getTime())) {
                    console.error(`Invalid notification time for event: ${event.name} with time: ${time}`);
                    return; // 무효한 시간은 건너뜀
                }

                if (time < new Date()) {
                    console.log(`Skipping past notification for event: ${event.name} at ${time}`);
                    return; // 과거 시간은 건너뜀
                }

                console.log(`Notification ${index + 1} scheduled at (local): ${time.toString()} for event: ${event.name}`);
                console.log(`Notification ${index + 1} scheduled at (UTC): ${time.toISOString()} for event: ${event.name}`);

                const job = schedule.scheduleJob(time, () => {
                    console.log(`Job executed for event: ${event.name} at ${new Date()}`);
                    const channel = client.channels.cache.get(channel_notice);
                    if (channel) {
                        channel.send(`중요도: **${event.importance.toUpperCase()}**\n이벤트: **${event.name}**\n일정: ${event.datetime}`);
                    } else {
                        console.error('Channel not found');
                    }
                });

                if (job === null) {
                    console.error(`Failed to schedule job for event: ${event.name} at ${time}`);
                } else {
                    console.log(`Scheduled job ${index + 1} for event: ${event.name} at ${time}`);
                }

                if (!scheduledJobs[event.id]) {
                    scheduledJobs[event.id] = [];
                }
                scheduledJobs[event.id].push(job);
            });
        });
    });
}
