const mongoose = require('mongoose')
const validator = require('validator')  
const bcrypt = require('bcryptjs') 
const jwt = require('jsonwebtoken')
const sharp = require('sharp')
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowerCase: true,
    validate(value) {
      if (!validator.isEmail(value))
        throw new Error('Email not valid')
    }

  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must not be a negative number')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    lowerCase: true,
    minlength: 7,
    validate(value) {
    
      if (!value === 'password') {
        throw new Error('password not allowed')
      }
    }

  } ,

  tokens: [{
    token : {
      type:  String,
      required:true
    }
  }],
  avatar: {
    type: Buffer
  }

},{
  timestamps: true
})   
  

    userSchema.virtual('task',{
      ref: 'Task',
      localField: '_id',
      foreignField: 'owner'
    })


  // hiding private data 

 userSchema.methods.toJSON =  function () {

const user = this 

const userObject =  user.toObject() 

delete userObject.password 
delete userObject.tokens
delete userObject.avatar  

return userObject

  }



 
 // getting authuntication token 

userSchema.methods.generateAuthToken = async function () {

  const user = this  
   
  const token = jwt.sign({_id : user._id.toString()} , process.env.JWT_SECRET) 

  user.tokens = user.tokens.concat({token})
  await user.save()

  return token
}


//authentication
userSchema.statics.findByCredentials = async (email,password) => {
  const user = await User.findOne({ email })  


if(!user) {
  throw new Error('unable to find user')
} 

const isMatch = await bcrypt.compare(password , user.password) 


if(!isMatch) {  
  throw new Error('unable to login')
}
 

  return user 
}

//hasg the plain text password in plain text
 userSchema.pre('save' ,async function(next){

  const user = this
  if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  } 

  next()
 })

//deleting tasks when deleting the user 
userSchema.pre('remove', async function(next){
const user = this

await Task.deleteMany({owner: user._id})

next()
})

const User = mongoose.model('user', userSchema)

module.exports = User