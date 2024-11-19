var express = require("express")
require("dotenv").config() // This loads the .env file

var app = express()
app.use(express.json())

var jwt = require("jsonwebtoken")
var bcrypt = require("bcryptjs")

var PORT = process.env.PORT || 3000;

var users = [ ]

async function initializeUsers() {

    var hashedPassword = await bcrypt.hash("password123", 10)
    users = [
        { id: 1, username: "user1", password: hashedPassword}
    ]
    console.log("Users initialized:", users)
}

// Initialize users and start the server only after initialization is done
initializeUsers().then((users) => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
})

// Login route
app.post("/login", async (req, res) => {
    var {username, password} = req.body

    if (!username || !password) {
        console.log("Username or password not provided");
        return res.status(400).json({ message: "Username and password are required." });
    }

    var user = users.find(u => u.username.trim() === username.trim())

    if (!user) {
        return res.status(400).json({message:"User not found"})
    }

    var matches = await bcrypt.compare(password, user.password)

    if (!matches) {
        return res.status(400).json({message: "Invalid password"})
    }

    // Generate JWT token
    var token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET, {expiresIn: "1h"})

    res.json({token})
})

// Authentication Middleware
var authenticate = (req, res, next) => {
    var token = req.header("Authorization")?.split(" ")[1]
    console.log("Token received:", token)

    if (!token) {
        return res.status(401).json({message: "Access denined. No token provided."})
    }

    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        next()
    }
    catch (err) {
        res.status(400).json({message: "Invalid token."})
    }
}

// Protected route example
app.get("/protected", authenticate, (req, res) => {
    res.json({message: "This is a protected route.", user: req.user})
})



