const express = require('express') 
const Task = require('../models/task')
const auth = require('../middleware/auth') 
const User = require('../models/user')   
const router = new express.Router() 



//posting tasks
router.post('/task',auth , async (req, res) => {
 
  const task  = new Task({
    ...req.body,
    owner: req.user._id
  })

  try{
    
    await task.save()
    res.status(201).send(task)
  }catch(e) {
    res.status(400).send(e)
  }
  
})
   

// getting tasks


// route = {{url}}/tasks?completed = true || false   (completed neet not be mentioned in the code)
// pagination requires 'limit' and 'skip' 
// for paginating => {{url}}/tasks?limit = (number of tasks to sj=how on a page)&skip = (number of tasks to skip )
// for sorting {{url}}/tasks/sortBy=createdAt:asc(for ascending order) || Desc(for descending order)
 router.get('/tasks', auth, async (req, res) => {
    
      const match = {}
      const sort = {}

      if(req.query.completed){
        match.completed = req.query.completed === 'true'
      } 


      if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] === 'desc' ? -1 : 1
      }


    try {
        await req.user.populate({
          path: 'task',
          match,
          options:{
            limit: parseInt(req.query.limit),
            skip:  parseInt(req.query.skip),
            sort
          }  
        }).execPopulate()
        res.send(req.user.task)
    } catch (e) {
        res.status(500).send()
    }
})



//getting individual tasks using id

router.get('/task/:id',auth, async (req,res) => { 

  const _id = req.params.id

try {
  const task = await Task.findOne({_id , owner :req.user._id})

  if(!task) {
    return res.status(404).send()
  }
  res.status(201).send(task)
} catch (e) {
  res.status(500).send
}


}) 






   //updating tasks 


router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


 //deleting task by id 

 router.delete('/task/:id' , auth , async (req,res) => {
  try {
    const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id  })

    if(!task) {
      res.status(404).send()
    }

res.status(200).send(task)
  } catch(e) {
    res.status(500).send(e)
  }
})  


module.exports = router