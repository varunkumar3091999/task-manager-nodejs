const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

// executes before taking the test
beforeEach(setupDatabase)


//test for signing up
test('should signup a new user', async () => { 

	const response = await request(app).post('/users').send({

		name: 'varun',
		email: 'varunkumar@gmail.com',
		password: 'Varun@30999'
	}).expect(201) 

	//assert that the database was changed correctly 
		const user = await User.findById(response.body.user._id)
		expect(user).not.toBeNull() 

	//assertions about the response 

		//expect(response.body.name).toBe('varun')  //cannot be used as it can only assert with the name
 
	expect(response.body).toMatchObject({    // toMatchObject()  user to compare response.body to the given objct below
		user: {
			name: 'varun'                    // to assert with respect to more than one object  
		},
		token: user.tokens[0].token
	}) 

	expect(user.password).not.toBe('Varun@30999') //making sure that the password is not a plaintext password
}) 

//test for logging in
test('logging in', async () => {
	const response = await request(app).post('/user/login').send({
		email: userOne.email,
		password: userOne.password
	}).expect(200)

	const user = await User.findById(userOneId)
	expect(response.body.token).toBe(user.tokens[1].token)
}) 

//test for not logginh in for nonexisting users
test('should not login nonexisting users', async () => {
	await request(app).post('/user/login').send({
		email: userOne.email,
		password: 'thisisnotmypass'
	}).expect(400)
}) 

//test for reading user profile
test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
}) 
//test for unautorized login
test('no unauthenticated user login', async () => {
	await request(app)
	.get('/users/me')
	.send()
	.expect(401)
}) 

//test for deleting users
test('delete user', async () => {
	const response = await request(app)
	.delete('/user/me')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.send()
	.expect(200) 

    const user = await User.findById(userOneId)
		expect(user).toBeNull() 

}) 

//test for unauthorized deeting of users
test('no unauthorized deleting of user accounts', async () => {
	await request(app)
	.delete('/user/me')
	.send()
	.expect(401)
}) 

test('uploading avatar', async () => {
	await request(app)
	.post('/users/me/avatar')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.attach('avatar', 'tests/fixtures/profile-pic.jpg')
	.expect(200) 

	const user = await User.findById(userOneId)
	expect(user.avatar).toEqual(expect.any(Buffer))
}) 


test('valid user fields', async () => {
	 await request(app)
	.patch('/user/me')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.send({
		name: 'jess'
	})

	expect(200) 

	const user = await User.findById(userOneId)
	expect(user.name).toEqual('jess')
}) 

test('invalid user fields', async () => {
	 await request(app)
	.patch('/user/me')
	.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
	.send({
		location: 'india'
	})

	expect(400)
}) 