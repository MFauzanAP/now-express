const express = require('express')
require('dotenv').config();
const bodyParser = require("body-parser")
const cors = require('cors')
const app = express()
const port = 5000;
const { validateEmail } = require('./validation')
require("./bot")
const users = require('./Users')
require('./aws');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors({
  origin: '*',
  credentials:true,
}))

app.get('/', (req, res) => {
  res.send({ "message": "The API is working!" })
})
// users.rankUser('1020365193768874055');
app.post('/register', async (req, res) => {
  let params = req.body
  let email = params.email
  let name = params.name
  if (email === undefined || name === undefined) {
    res.status(401).send({ "message": "Undfined fields are required.", "email": email != undefined ? undefined : "undefined", "name": name != undefined ? undefined : "undefined" })
    return
  }
  if (!validateEmail(email)) {
    res.status(401).send({ "message": "Invalid Email." })
    return
  }
  users.addUser(email, name).then(async function (created) {
    if (!created) {
      res.status(401).send({ "message": "User already exists." })
      return
    }
    res.send(await users.getUserData(email))
  })

})

app.post('/getUserData', async function (req, res) {
  console.log("Fetching user data...")
  if (req.body.hasOwnProperty("email")) {
    if (await users.isEmailRegistered(req.body.email)) {
      console.log("Data fetched successfully.")
      res.send(await users.getUserData(req.body.email))
      return
    }
    console.log("failed too look up user data for email address: " + req.body.email)
    res.status(400).send({"message": "User not registered"})
    return
  }
  res.status(401).send({ "message": "Email field is required." })
})

app.listen(port, () => {
  console.log(`GameDevEvent backend listening on port ${port}`)
})