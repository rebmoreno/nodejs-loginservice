var express = require("express")
require("dotenv").config()
console.log("JWT_SECRET:", process.env.JWT_SECRET);

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

initializeUsers().then((users) => {
    // Start the server after users have been initialized
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
})

app.get("/", (req, res) => {
    res.send("Login microservice is up and running!")
})


app.post("/login", async (req, res) => {
    var {username, password} = req.body
    console.log("Login attempt:", { username, password })


    if (!username || !password) {
        console.log("Username or password not provided");
        return res.status(400).json({ message: "Username and password are required." });
    }

    var user = users.find(u => u.username.trim() === username.trim())

    if (!user) {
        console.log("User not found")
        return res.status(400).json({message:"User not found"})
    }

    var matches = await bcrypt.compare(password, user.password)

    if (!matches) {
        console.log("Password mismatch")
        return res.status(400).json({message: "Invalid credentials"})
    }
    var token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET, {expiresIn: "1h"})

    res.json({token})
})

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

app.get("/protected", authenticate, (req, res) => {
    res.json({message: "This is a protected route.", user: req.user})
})



