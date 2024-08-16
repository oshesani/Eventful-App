const generateEventUrl = (eventId) => {
    const baseUrl = "http://localhost:8000/api/events";
    return `${baseUrl}/${eventId}`;
  };
  
  module.exports = generateEventUrl