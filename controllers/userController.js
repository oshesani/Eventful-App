const asyncHandler = require("express-async-handler");
const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

//@desc POST register User
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, isCreator } = req.body;

    console.log("Request Body:", req.body);

    if (!name || !email || !password || typeof isCreator === 'undefined') {
        console.log("All fields are mandatory")
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        console.log("User Already Exist")
        res.status(400);
        throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        isCreator,
    });

    console.log(`User Created ${user}`);

    if (user) {
        console.log("Sending Success response")
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isCreator: user.isCreator,
        });
    } else {
        console.log("User data is not valid")
        res.status(400);
        throw new Error("User data is not valid");
    }
});

//@desc POST login User
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body;
   if (!email ||!password) {
    res.status(400);
    throw new Error("All fields are mandatory")
   }
  
   const user = await  User.findOne({ email });

   //compsre password with hashed password
   if(user && (await bcrypt.compare(password, user.password))){
    //content of my access token
      const accessToken = jwt.sign({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        }
      }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20m"});
    res.status(200).json({accessToken})
   }else{
     res.status(401)
     throw new Error("Email or Password Not Valid!")
   }
});

module.exports = { registerUser, loginUser };
