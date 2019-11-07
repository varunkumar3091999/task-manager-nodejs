const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOneId,
		userOne,
		userTwoId,
		userTwo,
		taskOne,
		taskTwo,
		taskThree, 	 
		setupDatabase} = require('./fixtures/db')

// executes before taking the test
beforeEach(setupDatabase)


test('creating tasks', async () => {

	const response = await request(app)
	.post('/task')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.send({
		description: 'testing nodejs'
	})
	.expect(201) 
	const task = await Task.findById(response.body._id)
	expect(task).not.toBeNull()
	expect(task.completed).toBe(false)
})


test('getting tasks', async () => {
	const response = await request(app)
	.get('/tasks')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.send()
	.expect(200)
	expect(response.body.length).toBe(2)
}) 


test('Should not delete other users tasks', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})
