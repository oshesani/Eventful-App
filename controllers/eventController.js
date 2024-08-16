const asyncHandler = require("express-async-handler");
const Event = require("../models/eventModel");
const generateQRCode = require("../utility/qrcodeGenerator")
const notifyUserOfEvent = require("../utility/notify.utility")
const generateEventUrl = require("../utility/urlGenerator")
const setReminder = require("../utility/setReminder")





//@desc craete event
//@route POST/api/events
//@access private
const createEvent = asyncHandler(async (req, res) => {
  try {
    const { title, description, date, reminderTime, isCreator } = req.body;
    const creatorId = req.user._id;

    if (!title || !description || !date) {
      res.status(400);
      throw new Error("All fields are Mandatory");
    }

    const eventDate = new Date(date);
    const currentDate = new Date();

    if (eventDate < currentDate) {
      res.status(400);
      throw new Error("Event date cannot be in the past");
    }

    if (isCreator && reminderTime) {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + reminderTime);
      if (reminderDate <= currentDate) {
        res.status(400);
        throw new Error("Reminder time must be in the future");
      }
    }

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      creator: creatorId,
      creatorId: creatorId,
      attendees: [],
      creatorReminder: isCreator && reminderTime ? reminderTime : 1
    });

    const shareableUrl = generateEventUrl(event._id);
    const qrCodeData = `${event._id}-${creatorId}`;
    const qrCodeUrl = await generateQRCode(qrCodeData);

    if (isCreator && reminderTime && typeof reminderTime === 'number') {
      await setReminder(event._id, reminderTime, true, creatorId);
    }

    // Send email to the creator
    const message = `Your event "${event.title}" has been created successfully!`;
    const subject = `Event Created: ${event.title}`;
    try {
      await notifyUserOfEvent(req.user.email, { title: event.title, date: event.date });
      console.log('Email sent to event creator:', req.user.email);
    } catch (error) {
      console.error('Error sending email to event creator:', error);
    }

    res.status(201).json({
      event,
      shareableUrl,
      qrCodeUrl
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(400).json({ message: error.message });
  }
});


//@desc apply event
 //@route POST/api/:id/apply
//@access private
//@desc apply event
//@route POST/api/:id/apply
//@access private
const applyEvent = asyncHandler(async (req, res) => {   
  const { eventId, reminderTime } = req.body;
  const userId = req.user._id;
  
  if (!eventId || !reminderTime) {
    return res.status(400).json({ message: "Event ID and reminder time are required" });
  }

  // Verify that reminder time is in the future
  const currentDate = new Date();
  if (reminderTime) {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + reminderTime);
    if (reminderDate <= currentDate) {
      return res.status(400).json({ message: "Reminder time must be in the future" });
    }
  }

  console.log("User ID:", userId);

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Oops Event not found" });
  }

  if (event.attendees.includes(userId)) {
    return res.status(400).json({ message: "User already attending" });
  }

  // Push the userId to attendees without affecting other fields
  event.attendees.push(userId);

  // Preserve creatorId explicitly
  event.creatorId = event.creatorId || req.user._id;

  await event.save();

  const updatedEvent = await Event.findById(eventId).populate('attendees', 'name email');

  const qrCodeData = `${eventId}-${userId}`;
  const qrCodeUrl = await generateQRCode(qrCodeData);

  // Send email notification to event creator
  const creatorEmail = event.creatorId.email; // Adjust if necessary
  const creatorSubject = `New Application for Your Event: ${updatedEvent.title}`;
  const creatorMessage = `Hi, you have a new application for your event "${updatedEvent.title}".`;

  try {
    await notifyUserOfEvent(creatorEmail, {
      title: updatedEvent.title,
      date: updatedEvent.date
    });
    console.log('Email sent to event creator:', creatorEmail);
  } catch (error) {
    console.error('Failed to send email to event creator:', error);
  }

  // Send email notification to applying user
  const userEmail = req.user.email; // Adjust if necessary
  const userSubject = `Successfully Applied to Event: ${updatedEvent.title}`;
  const userMessage = `Hi, you have successfully applied to the event "${updatedEvent.title}".`;

  try {
    await notifyUserOfEvent(userEmail, {
      title: updatedEvent.title,
      date: updatedEvent.date
    });
    console.log('Email sent to applying user:', userEmail);
  } catch (error) {
    console.error('Failed to send email to applying user:', error);
  }

  if (reminderTime && typeof reminderTime === 'number') {
    await setReminder(eventId, reminderTime, false, userId);
  }

  res.status(200).json({
    message: "Successfully applied to the event",
    event: updatedEvent,
    qrCodeUrl
  });
});


//desc get my  event
//@route GET/api/event/my-events
//@access private
const getMyEvent = asyncHandler(async(req,res) => {
  const userId = req.user._id
  const events = await Event.find({creator: userId})

  if (!events || events.length === 0){
    res.status(404)
    throw new Error("No events found")
  }
  res.status(200).json({ message: "These are events you have created", events: events });

})

// @desc Get event by ID
// @route GET /api/events/:id
// @access Private 
const getEventById = asyncHandler(async (req, res) => {
 //const eventId = req.params.id;


  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error retrieving event:', error);
    res.status(500).json({ message: error.message });
  }
});




//@desc GET events
//@route GET/api/event
//@access private
const getEvents = asyncHandler(async(req,res) => {
    const events = await Event.find()
  res.status(200).json(events)
})






module.exports = {createEvent, applyEvent, getMyEvent, getEvents, getEventById};
