const mongoose = require('mongoose')

mongoose.connect(process.env.MANGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false	
})






