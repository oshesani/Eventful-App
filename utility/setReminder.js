const Event = require("../models/eventModel");

const setReminder = async (eventId, reminderTime, isCreator, userId) => {
  try {
    if (reminderTime && typeof reminderTime !== 'number') {
      throw new Error('Invalid reminder days value');
    }

    let updateQuery;
    let updateField;

    if (isCreator) {
      updateQuery = { _id: eventId, creator: userId };
      updateField = { $set: { creatorReminder: reminderTime } };
    } else {
      updateQuery = { _id: eventId, 'attendeeReminders.userId': userId };
      const event = await Event.findOne(updateQuery);
      if (!event) {
        updateField = { $push: { attendeeReminders: { userId, reminderDays: reminderTime } } };
      } else {
        updateField = { $set: { 'attendeeReminders.$.reminderDays': reminderTime } };
      }
    }

    const updatedEvent = await Event.findOneAndUpdate(updateQuery, updateField, {
      new: true,
      runValidators: true,
      context: 'query', // Ensure this is treated as a query context
    });

    if (!updatedEvent) {
      throw new Error('Event not found or user not authorized');
    }

    return updatedEvent;

  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = setReminder;
