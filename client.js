var axios = require("axios")

var token = '';  // Variable to store JWT token
var userData = {};  // Variable to store user data (if any)

async function login(username, password) {

    try {
        var response = await axios.post("http://localhost:3000/login", {
            username: username,
            password: password
        })

        token = response.data.token
        console.log("Login sucessful!")
        console.log("JWT token:", token)
        // userData = response.data.user || {}; // If you have other user data in the response

    }
    catch (error) {
        console.log("Login failed.", error.response ? error.response.data : error.message)
    }
}

async function accessProtectedData() {
    if (!token) {
      console.log("You must log in first to access protected data.")
      return
    }
  
    try {
      // Make a GET request to the protected route, including the JWT token
      const response = await axios.get("http://localhost:3000/protected", {
        headers: {
          "Authorization": `Bearer ${token}`  // Include the JWT token in the Authorization header
        }
      })
      console.log("Protected Data:", response.data)
      
      userData = response.data
  
    }
     catch (error) {
      console.error("Access denied, invalid token:", error.response ? error.response.data : error.message);
    }
  }
  
  // Reset function to clear received data
  function resetData() {
    token = '' 
    userData = {};  
  
    console.log("Data has been reset.")
  }
  
  // Example usage of the login function and accessing protected data
  login("user1", "password123").then(() => {
    accessProtectedData()
  
    // Reset data after some time or after logout
    setTimeout(() => {
      resetData()
      console.log("After reset:", { token, userData })
    }, 5000)
  })