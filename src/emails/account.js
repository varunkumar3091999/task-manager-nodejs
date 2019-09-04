const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const  sendWelcomeEmail = (email,name) => {

		sgMail.send({
			to: email,
			from: 'varunkumar0930@gmail.com',
			subject: 'hi',
			text: 'thanks for joining,${name}'

		})

} 


const sendCancelEmail = (email, name) => {
	sgMail.send({
			to: email,
			from: 'varunkumar0930@gmail.com',
			subject: 'hi',
			text: 'your account has been cancelled'

		})
}

module.exports = {
	sendWelcomeEmail ,
	sendCancelEmail
}