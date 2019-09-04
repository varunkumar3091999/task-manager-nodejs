const mongoose = require('mongoose')
// const validator = require('validator')




const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    required: false,
    default: false
  },
  owner: {
    type : mongoose.Schema.Types.ObjectId  ,
    required : true,
    ref : 'User'
  }
}, {
  timestamps: true
})

const Task = new mongoose.model('Task', taskSchema) 



//  taskSchema.pre('save' ,async function(next){

//   const task = this
//   if(task.isModified('password')) {
//     task.password = await bcrypt.hash(task.password, 8)
//   } 

//   next()
//  })

// const Task = mongoose.model('Task' , taskSchema) 

module.exports = Task