const sendEmail = require('./utility/sendEmail');

(async () => {
    try {
        await sendEmail('test@example.com', 'Test Subject', 'This is a test message.');
        console.log('Test email sent.');
    } catch (error) {
        console.error('Error sending test email:', error);
    }
})();
