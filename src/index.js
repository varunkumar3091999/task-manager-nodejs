const app = require(./app)
//creating PORT
const port = process.env.PORT   


//text on the terminal when code runs successfully
app.listen(port, () => {
  console.log('Server is up on port ' + port)
}) 

   

