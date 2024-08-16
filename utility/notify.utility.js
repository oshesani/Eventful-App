const sendEmail = require("../utility/sendEmail"); 

const notifyUserOfEvent = async (userEmail, eventDetails) => {
    const subject = `Reminder: Upcoming Event - ${eventDetails.title}`;
    const message = `This is a reminder that the event "${eventDetails.title}" is scheduled for ${eventDetails.date.toDateString()}. Make sure to mark your calendar!`;
    
    try {
        await sendEmail(userEmail, subject, message);
        console.log('Event reminder email sent successfully');
    } catch (error) {
        console.error('Failed to send event reminder email:', error);
    }
};

module.exports = notifyUserOfEvent;
