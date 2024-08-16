const cron = require('node-cron');
const Event = require("../models/eventModel");
const notifyUserOfEvent = require("../utility/notify.utility");
const moment = require('moment'); // Consider using moment.js for date handling

const cronReminder =  cron.schedule('* * * * *', async () => {
    console.log('Cron job is running...');
    const today = moment().startOf('day').toDate(); // Reset time to the start of the day

    try {
        // Find events where the reminder date matches today's date
        const events = await Event.find({
            $or: [
                { 
                    creatorReminder: today,
                    creatorId: { $exists: true }
                },
                {
                    'attendeeReminders.reminderDays': today,
                    'attendees.userId': { $exists: true }
                }
            ]
        }).populate('creatorId attendees.userId');

        // Notify event creators and attendees
        for (const event of events) {
            console.log('Processing event:', event.title);

            if (event.creatorReminder && moment(event.creatorReminder).isSame(today, 'day')) {
                console.log('Creator reminder matches today for event:', event.title);
                const message = `Reminder: Your event "${event.title}" is coming up on ${moment(event.date).format('MMMM D, YYYY')}!`;
                try {
                    await notifyUserOfEvent(event.creatorId.email, {
                        title: event.title,
                        date: event.date
                    });
                    console.log('Reminder sent to event creator:', event.creatorId.email);
                } catch (error) {
                    console.error('Error sending email to event creator:', error);
                }
            }

            // Notify event attendees
            for (const attendeeReminder of event.attendeeReminders) {
                if (attendeeReminder.reminderDays && moment(attendeeReminder.reminderDays).isSame(today, 'day')) {
                    const message = `Reminder: The event "${event.title}" you're attending is on ${moment(event.date).format('MMMM D, YYYY')}!`;
                    try {
                        const attendeeUser = event.attendees.find(user => user._id.equals(attendeeReminder.userId));
                        if (attendeeUser) {
                            await notifyUserOfEvent(attendeeUser.email, {
                                title: event.title,
                                date: event.date
                            });
                            console.log('Reminder sent to event attendee:', attendeeUser.email);
                        } else {
                            console.log('Attendee not found for reminder:', attendeeReminder.userId);
                        }
                    } catch (error) {
                        console.error('Error sending email to event attendee:', error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error retrieving events:', error);
    }
});

module.exports = cronReminder;
