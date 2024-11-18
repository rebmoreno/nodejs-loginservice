var axios = require("axios")

async function login(username, password) {

    try {
        var response = await axios.post("http://localhost:3000/login", {
            username: username,
            password: password
        })

        console.log("Login sucessful!")
        console.log("JWT token:", response.data.token)

    }
    catch (error) {
        console.log("Loging failed.", error.response ? error.response.data : error.message)
    }
}

login("user1", "password123")