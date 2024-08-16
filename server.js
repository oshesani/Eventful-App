const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const cronReminder = require("./cron/eventReminderJob")
require('dotenv').config();
const sendEmail = require("./utility/sendEmail")
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
// Read and parse the Swagger YAML file
const swaggerDocument = YAML.parse(fs.readFileSync("./swagger.yaml", "utf8"));
const cors = require("cors")
const { generalLimiter } = require("./middleware/rateLimiter")
const swaggerSetup = require("./swagger")




connectDb();

const app = express()
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const port = process.env.PORT || 8000;


app.use(generalLimiter);
app.use(cors({
  origin: ['http://localhost:8000', 'http://staging-api.eventful.com']
}));

app.use(express.json());



app.get('/', (req, res) => {
    res.send('Server is working!');
  });
  

app.use("/api/events", require("./routes/eventRoutes")); 
app.use("/api/users", require("./routes/userRoute")); 

app.use(errorHandler)
swaggerSetup(app)

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);

    // Start the cron job after the server has started
    cronReminder.start(); 
  });
}


/* app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});*/

module.exports = app;
