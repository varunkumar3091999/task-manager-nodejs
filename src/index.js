const express = require('express'),//url module
  bodyParser = require('body-parser')//parsing data module

//file importing
const mongoose = require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/userRoute')
const taskRouter  = require('./routers/taskRoute')

const app = express()
app.use(bodyParser.urlencoded({
  extended: true
}));

//creating PORT
const port = process.env.PORT  



//to display data in json format
app.use(express.json()) 

app.use(userRouter)
app.use(taskRouter)




//text on the terminal when code runs successfully
app.listen(port, () => {
  console.log('Server is up on port ' + port)
}) 

   

