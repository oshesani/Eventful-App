const express = require("express")
const router = express.Router();
const {createEvent, applyEvent, getEvents, getMyEvent, getEventById} = require("../controllers/eventController");
const checkCreator = require("../middleware/checkCreator");
const validateToken = require("../middleware/validateTokenHandler");
const {createEventLimiter,           applyEventLimiter,
    getMyEventLimiter,
    getEventsLimiter,
    getEventByIdLimiter} = require("../middleware/rateLimiter")



router.use(validateToken)
router.route("/create-event").post(createEventLimiter,createEvent, checkCreator);
router.route("/apply-event").post(applyEventLimiter,applyEvent);
router.route("/my-events").get(getMyEventLimiter,getMyEvent);
router.route("/").get( getEventsLimiter,getEvents);
router.route("/:id").get(getEventByIdLimiter,getEventById);





module.exports = router;