// Email setup (using nodemailer for demo)
const nodemailer = require('nodemailer');

// Configure your SMTP transport for Gmail (use an App Password, not your main password)
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'testsoftdel@gmail.com', // replace with your Gmail address
		pass: 'kflo yqwg tukl cvcx' // generate an App Password in your Google Account
	}
});

function sendWarningEmail(to, floor, type, value) {
	let subject = '';
	let text = '';
	if (type === 'temperature') {
		subject = `Temperature Alert for Floor ${floor}`;
		text = `Warning: The temperature on floor ${floor} has reached ${value.toFixed(2)}°C. Please take necessary action.`;
	} else if (type === 'fireAlarm') {
		subject = `FIRE ALARM ACTIVE on Floor ${floor}`;
		text = `URGENT: The fire alarm is ACTIVE on floor ${floor}. Please evacuate immediately!`;
	}
	const mailOptions = {
		from: 'wadkardeepak111@gmail.com',
		to,
		subject,
		text
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Error sending email:', error);
		} else {
			console.log('Warning email sent:', info.response);
		}
	});
}

function checkAndSendTemperatureWarnings() {
	sensorData.forEach((floorData, idx) => {
		const floorNum = idx + 1;
		const floorUsers = users.filter(u => u.floor === floorNum);
		if (floorData.temperature > 30) {
			floorUsers.forEach(user => {
				sendWarningEmail(user.email, floorNum, 'temperature', floorData.temperature);
			});
		}
		if (floorData.fireAlarm) {
			floorUsers.forEach(user => {
				sendWarningEmail(user.email, floorNum, 'fireAlarm', true);
			});
		}
	});
}
// Demo user list for each floor
const users = [
	{ name: 'User 1', email: 'deepak.wadkar@softdel.com', floor: 1 },
	{ name: 'User 2', email: 'narendra.hinge@softdel.com', floor: 2 },
	{ name: 'User 3', email: 'dhanashri.sonawane@softdel.com', floor: 3 }
];
// Dummy sensor data generator and API for Emergency Evacuation System

const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json()); // for parsing application/json
const PORT = process.env.PORT || 3000;
// API endpoint to send fire alarm email to all users (active/inactive)
// Usage: POST /api/send-alarm-email { status: 'active' | 'inactive' }
app.post('/api/send-alarm-email', (req, res) => {
	const { status } = req.body;
	if (!status || (status !== 'active' && status !== 'inactive')) {
		return res.status(400).json({ error: 'Status must be "active" or "inactive"' });
	}
	const subject = status === 'active' ? 'FIRE ALARM ACTIVE' : 'Fire Alarm Inactive';
	const text = status === 'active'
		? 'URGENT: The fire alarm is ACTIVE. Please evacuate immediately!'
		: 'Info: The fire alarm is now INACTIVE. Situation is under control.';
	let sent = 0;
	users.forEach(user => {
		const mailOptions = {
			from: 'wadkardeepak111@gmail.com',
			to: user.email,
			subject,
			text
		};
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error('Error sending alarm email:', error);
			} else {
				console.log('Alarm email sent:', info.response);
			}
		});
		sent++;
	});
	res.json({ message: `Alarm email (${status}) sent to ${sent} users.` });
});


// Enable CORS for all origins
app.use(cors());

// Dummy data state for 3 floors
let sensorData = [
	{}, {}, {}
];


function randomizeFloorData(floor) {
	return {
		floor: floor,
		tvoc: Math.floor(Math.random() * 1000),
		fireAlarm: Math.random() > 0.8,
		co2: 400 + Math.floor(Math.random() * 600),
		temperature: 20 + Math.random() * 10,
		smokeDetected: Math.random() > 0.85,
		lastUpdated: new Date().toISOString()
	};
}

// Randomize dummy data for each floor every 5 seconds
setInterval(() => {
	sensorData = [
		randomizeFloorData(1),
		randomizeFloorData(2),
		randomizeFloorData(3)
	];
	checkAndSendTemperatureWarnings();
}, 5000);

// API endpoint to get current sensor data for all floors and user list
app.get('/api/sensors', (req, res) => {
	res.json({
		floors: sensorData,
		users: users
	});
});

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
	console.log(`Emergency Evacuation System backend running on port ${PORT}`);
});
