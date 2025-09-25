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
	let html = '';
	if (type === 'temperature') {
		subject = `Temperature Alert for Floor ${floor}`;
		text = `Warning: The temperature on floor ${floor} has reached ${value.toFixed(2)}°C. Please take necessary action.`;
		html = `
		<div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 24px; border-radius: 10px; max-width: 480px; margin: auto;">
		  <h2 style="color: #d84315;">Temperature Alert 🚨</h2>
		  <p style="font-size: 1.1em; color: #333;">The temperature on <b>Floor ${floor}</b> has reached <span style='color:#d84315;font-weight:bold;'>${value.toFixed(2)}°C</span>.</p>
		  <p style="color: #444;">Please take necessary action to ensure safety.</p>
		  <hr style="border:none; border-top:1px solid #eee; margin:16px 0;">
		  <div style="font-size:0.95em; color:#888;">Emergency Evacuation System</div>
		</div>
		`;
	} else if (type === 'fireAlarm') {
		subject = `FIRE ALARM ACTIVE on Floor ${floor}`;
		text = `URGENT: The fire alarm is ACTIVE on floor ${floor}. Please evacuate immediately!`;
		html = `
		<div style="font-family: Arial, sans-serif; background: #fff3e0; padding: 24px; border-radius: 10px; max-width: 480px; margin: auto; border: 2px solid #ff7043;">
		  <h2 style="color: #b71c1c;">🔥 FIRE ALARM ACTIVE</h2>
		  <p style="font-size: 1.1em; color: #b71c1c;">The fire alarm is <b>ACTIVE</b> on <b>Floor ${floor}</b>.</p>
		  <p style="color: #b71c1c; font-weight: bold;">Please evacuate immediately!</p>
		  <hr style="border:none; border-top:1px solid #ff7043; margin:16px 0;">
		  <div style="font-size:0.95em; color:#888;">Emergency Evacuation System</div>
		</div>
		`;
	}
	const mailOptions = {
		from: 'wadkardeepak111@gmail.com',
		to,
		subject,
		text,
		html
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
				// sendWarningEmail(user.email, floorNum, 'temperature', floorData.temperature);
			});
		}
		if (floorData.fireAlarm) {
			floorUsers.forEach(user => {
				// sendWarningEmail(user.email, floorNum, 'fireAlarm', true);
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
	const html = status === 'active'
		? `<div style="font-family: Arial, sans-serif; background: #fff3e0; padding: 24px; border-radius: 10px; max-width: 480px; margin: auto; border: 2px solid #ff7043;">
			  <h2 style=\"color: #b71c1c;\">🔥 FIRE ALARM ACTIVE</h2>
			  <p style=\"font-size: 1.1em; color: #b71c1c;\">The fire alarm is <b>ACTIVE</b> in the building.</p>
			  <p style=\"color: #b71c1c; font-weight: bold;\">Please evacuate immediately!</p>
			  <hr style=\"border:none; border-top:1px solid #ff7043; margin:16px 0;\">
			  <div style=\"font-size:0.95em; color:#888;\">Emergency Evacuation System</div>
			</div>`
		: `<div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 24px; border-radius: 10px; max-width: 480px; margin: auto;">
			  <h2 style=\"color: #388e3c;\">Fire Alarm Inactive</h2>
			  <p style=\"font-size: 1.1em; color: #333;\">The fire alarm is now <b>INACTIVE</b>. Situation is under control.</p>
			  <hr style=\"border:none; border-top:1px solid #eee; margin:16px 0;\">
			  <div style=\"font-size:0.95em; color:#888;\">Emergency Evacuation System</div>
			</div>`;
	let sent = 0;
	users.forEach(user => {
		const mailOptions = {
			from: 'wadkardeepak111@gmail.com',
			to: user.email,
			subject,
			text,
			html
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
// Track testing state for each floor (true = testing, no mails)
let floorTesting = [false, false, false];


// Randomize dummy data for each floor every 5 seconds
setInterval(() => {
	for (let idx = 0; idx < sensorData.length; idx++) {
		if (floorTesting[idx]) continue; // skip if testing
		// Update sensor data for this floor
		sensorData[idx] = randomizeFloorData(idx + 1);
		// Email logic (if needed, e.g. for demo)
		const floorNum = idx + 1;
		const floorUsers = users.filter(u => u.floor === floorNum);
		const floorData = sensorData[idx];
		if (floorData.temperature > 30) {
			floorUsers.forEach(user => {
				//sendWarningEmail(user.email, floorNum, 'temperature', floorData.temperature);
			});
		}
		if (floorData.fireAlarm) {
			floorUsers.forEach(user => {
				//sendWarningEmail(user.email, floorNum, 'fireAlarm', true);
			});
		}
	}
}, 5000);


app.get('/api/sensors', (req, res) => {
	res.json({
		floors: sensorData,
		users: users,
		floorTesting: floorTesting
	});
});

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', time: new Date().toISOString() });
});
// API endpoint to set testing state for a floor
// Usage: POST /api/floor-testing { floor: 1 | 2 | 3, testing: true | false }
app.post('/api/floor-testing', (req, res) => {
	const { floor, testing } = req.body;
	if (![1, 2, 3].includes(floor) || typeof testing !== 'boolean') {
		return res.status(400).json({ error: 'Invalid floor or testing value' });
	}
	floorTesting[floor - 1] = testing;
	res.json({ message: `Testing for floor ${floor} set to ${testing}` });
});

app.listen(PORT, () => {
	console.log(`Emergency Evacuation System backend running on port ${PORT}`);
});
