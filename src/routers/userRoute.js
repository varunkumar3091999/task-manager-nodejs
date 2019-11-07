  const express = require('express') //url module
  const multer  = require('multer') //file uploading module 
  const sharp = require('sharp')// image cropping module
  const {sendWelcomeEmail , sendCancelEmail} = require('../emails/account')

const User = require('../models/user') // file path
const auth = require('../middleware/auth') //file path 



const router = new express.Router()

//posting users

router.post('/users', async (req, res) => {

const  user = new User(req.body)
try{

  await user.save() 

  sendWelcomeEmail(user.email, user.name)

  const token = await user.generateAuthToken()
res.status(201).send({user  , token})

}catch (e){
res.status(400).send(e)
} 
})
  

 //creating user login 


 router.post('/user/login' , async (req,res) => {
  try{
    const user = await User.findByCredentials(req.body.email , req.body.password) 
    const token = await user.generateAuthToken()
    
    res.status(200).send({ user, token}) 


   } catch (e) {
    console.log(e)
    res.status(400).send({err: e}) } })

 
// logging out

router.post('/users/logout' ,auth , async (req,res) => {
  try{

      req.user.tokens =  req.user.tokens.filter((token) => {
        return token.token !== req.token
      })

      req.user.save() 

      console.log(req.user)

      res.status(200).send()

  } catch(e) {
      console.log(e)
      res.status(500).send()  
  }
})



// getting users

router.get('/users/me', auth , async (req,res) => {
  res.send(req.user)

})


//updating user

router.patch('/user/me', auth , async (req,res) => { 

const updates = Object.keys(req.body)
const allowedUpdates = ['name','password','email','age']
const isValidOperation  = updates.every((update) => allowedUpdates.includes(update))

if(!isValidOperation) {
  return  res.status(400).send({error: 'invalid update'})
}




  try{ 

    updates.forEach((update) =>  req.user[update] = req.body[update])    

     await req.user.save() 
   
      res.status(200).send(req.user) 
   
  } catch(e) {
    res.status(400).send(e)
  } 
})

 
 
 //deleting user 
router.delete('/user/me' , auth , async (req,res) => {
  try {
    
    await req.user.remove() 
    sendCancelEmail(req.user.email , req.user.name)

    return res.status(200).send(req.user)
  } catch(e) {
    console.log(e)
    return res.status(500).send(e)
  }
}) 
 
  //setting limatitions for the profile picture
 const upload= multer({
  
 limits: {
    fileSize: 1000000
  
  },
  fileFilter(req,file,cb) {
    if(!file.originalname.match(/.(jpg|jpeg|png)$/)){
      return new Error('please upload an image')
    } 


    cb(undefined,true)
  }
  

})

// Adding a profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})
// Deleting profile picture
router.delete('/user/me/avatar' , auth , async (req,res) => {
  req.user.avatar = undefined 
  await req.user.save()
   res.status(200).send()
}) 



//getting user avatar by id 

router.get('/users/:id/avatar', async (req, res) => {
 try {
 const user = await User.findById(req.params.id)
 if (!user || !user.avatar) {
 throw new Error()
 }
 res.set('Content-Type', 'image/png')
 res.send(user.avatar)
 } catch (e) {
 res.status(404).send()
 }
})


module.exports = router