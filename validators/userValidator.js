const Joi = require('joi');

const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail.com$/; 
const registerSchema = Joi.object({
  name: Joi.string().min(4).max(30).required(),
  email: Joi.string().pattern(emailPattern).required(),
  password: Joi.string().min(6).required(),
  isCreator: Joi.boolean().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailPattern).required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
