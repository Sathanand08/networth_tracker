const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendPaymentReminder = async (phoneNumber, customerName, amount, dueDate) => {
  try {
    const message = await client.messages.create({
      body: `Hello ${customerName}, this is a reminder that you have a pending payment of ${amount} due on ${dueDate}. Please arrange for payment.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return message.sid;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return null;
  }
};