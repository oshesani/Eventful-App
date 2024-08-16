
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  creator: String,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming you have a User model
  }],
  creatorReminder: {
    type: Number,
    default: 1
  },
  attendeeReminders: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model
      required: true
    },
    reminderDays: {
      type: Number,
      default: 1
    }
  }]
});
/*const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  creator: String,
  creatorId: mongoose.Schema.Types.ObjectId,
  attendees: [mongoose.Schema.Types.ObjectId],
  creatorReminder: {
    type: Number, // Number of days before the event
    default: 1
  },
  attendeeReminders: [{
    userId: mongoose.Schema.Types.ObjectId,
    reminderDays: {
      type: Number, // Number of days before the event
      default: 1
    }
  }]
});


/*module.exports = mongoose.model('Event', eventSchema);*/
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;