const fs = require('fs');
	// Debug log for attachment path
	
const path = require('path');
const os = require('os');
const attachmentPath = path.join(os.homedir(), 'Downloads', 'EvacuationRoute.png');
	console.log('Attachment path:', attachmentPath);
	// if (!fs.existsSync(attachmentPath)) {
	// 	console.error('Attachment file does NOT exist at:', attachmentPath);
	// 	return;
	// }
// ...existing code...

// ...existing code...


// (moved below, after app is initialized)
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

function sendWarningEmail(to, userName, floor, type, value, isBuildingLevel = false) {
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
		const floorText = isBuildingLevel ? 'the building' : `Floor ${floor}`;
		subject = isBuildingLevel ? `FIRE ALARM ACTIVE in Building` : `FIRE ALARM ACTIVE on Floor ${floor}`;
		text = `URGENT: The fire alarm is ACTIVE on ${floorText}. Please evacuate immediately!`;
		html = `
			<div style="font-family: Arial, sans-serif; background: #fff3e0; padding: 24px; border-radius: 10px; max-width: 540px; margin: auto; border: 2px solid #ff7043;">
				<p style="font-size:1.1em; color:#b71c1c; margin-bottom: 0.5em;">Dear <b>${userName}</b>,</p>
				<p style="color:#b71c1c;">A fire alarm has been triggered in <b>${floorText}</b> at <b>${new Date().toLocaleTimeString()}</b>.<br>
				For your safety, please evacuate immediately using the route provided below:</p>
				<div style="margin: 1em 0; padding: 1em; background: #fff; border-radius: 8px; border: 1px solid #ff7043;">
					<span style="font-size:1.2em;">👉</span> <b>Your shortest evacuation route:</b><br>
					<span>[e.g., From your current location → Exit through Stairwell B (next to Conference Room) → Assemble at Parking Lot C]</span>
				</div>
				<ul style="color:#b71c1c; margin:0 0 1em 1.2em; padding:0;">
					<li>⚠️ <b>Do NOT use elevators.</b></li>
					<li>⚠️ <b>Assist persons with disabilities if nearby.</b></li>
				</ul>
				<p>Once outside, please assemble at the designated assembly area:</p>
				<div style="margin: 0.5em 0 1em 0;">
					<span style="font-size:1.2em;">📍</span> <b>[Assembly Point Location]</b>
				</div>
				<p>Safety Team Contact: <b>Code Doctors + 1234567890</b></p>
				<img src="https://i.imgur.com/1Q9Z1Z1.png" alt="Evacuation Route" style="width:100%;max-width:400px;margin:16px 0;border-radius:8px;border:1px solid #ccc;" />
				<p style="margin-top:1.5em; color:#333;">Stay safe,<br><b>Code Doctors Team</b></p>
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
		html,
		   // attachments: [
		   //     {
		   //         filename: 'EvacuationRoute.png',
		   //         path: attachmentPath,
		   //         cid: 'evacuationrouteimg'
		   //     }
		   // ]
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
	{ name: 'Deepak', email: 'deepak.wadkar@softdel.com', floor: 1 , role: 'admin'},
	{ name: 'Narendra', email: 'narendra.hinge@softdel.com', floor: 2 , role: 'nmUser'},
	{ name: 'Dhanashri', email: 'dhanashri.sonawane@softdel.com', floor: 3 , role: 'nmUser'},
	{ name: 'Tejswini', email: 'dhanashri.sonawane@softdel.com', floor: 2 , role: 'nmUser'},
	{ name: 'Alex', email: 'alex.sonawane@softdel.com', floor: 3 , role: 'nmUser'},
	{ name: 'Manisha', email: 'dhanashri.sonawane@softdel.com', floor: 2 , role: 'nmUser'},
	{ name: 'Dhanashri', email: 'dhanashri.sonawane@softdel.com', floor: 3 , role: 'nmUser'}
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


// Dummy data state for 3 floors (initialize with valid random data)
let sensorData = [
	randomizeFloorData(1),
	randomizeFloorData(2),
	randomizeFloorData(3)
];


function randomizeFloorData(floor) {
       // Helper to pick good or poor value for a sensor
       function pickGoodOrPoor(goodRange, poorRange) {
	       return Math.random() > 0.5
		       ? goodRange[0] + Math.random() * (goodRange[1] - goodRange[0])
		       : poorRange[0] + Math.random() * (poorRange[1] - poorRange[0]);
       }
       return {
	       floor: floor,
	       tvoc: Math.random() > 0.5
		       ? Math.floor(Math.random() * 300) // good < 300
		       : Math.floor(700 + Math.random() * 300), // poor >= 700
	       fireAlarm: Math.random() > 0.8,
	       co2: Math.random() > 0.5
		       ? 400 + Math.floor(Math.random() * 400) // good < 800
		       : 1200 + Math.floor(Math.random() * 400), // poor >= 1200
	       temperature: Math.random() > 0.5
		       ? 20 + Math.random() * 6 // good 20-26
		       : (Math.random() > 0.5
			       ? 10 + Math.random() * 7.99 // poor < 18
			       : 28.01 + Math.random() * 7), // poor > 28
	       humidity: Math.random() > 0.5
		       ? 30 + Math.random() * 30 // good 30-60
		       : (Math.random() > 0.5
			       ? 10 + Math.random() * 9.99 // poor < 20
			       : 70.01 + Math.random() * 20), // poor > 70
	       pm25: Math.random() > 0.5
		       ? Math.floor(Math.random() * 35) // good < 35
		       : Math.floor(75 + Math.random() * 100), // poor >= 75
	       pm10: Math.random() > 0.5
		       ? Math.floor(Math.random() * 50) // good < 50
		       : Math.floor(150 + Math.random() * 100), // poor >= 150
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


// API endpoint to set fire alarm state for a floor and pause/resume value updates
// Usage: POST /api/floor-fire-alarm { floor: 1 | 2 | 3, fireAlarm: true | false }
// Usage: POST /api/floor-fire-alarm { floor: 0 | 1 | 2 | 3, fireAlarm: true | false }
app.post('/api/floor-fire-alarm', (req, res) => {
	console.log('API called: /api/floor-fire-alarm', req.body);
	const { floor, fireAlarm } = req.body;
	if (!([0,1,2,3].includes(floor)) || typeof fireAlarm !== 'boolean') {
		return res.status(400).json({ error: 'Invalid floor or fireAlarm value' });
	}
	if (floor === 0) {
		// Building-level alarm: set all floors, send to all users
		for (let i = 0; i < sensorData.length; i++) {
			sensorData[i].fireAlarm = fireAlarm;
			floorTesting[i] = fireAlarm;
		}
		if (fireAlarm) {
			users.forEach(user => {
				sendWarningEmail(user.email, user.name, user.floor, 'fireAlarm', true, true);
			});
		}
		return res.json({ message: `Fire alarm for building set to ${fireAlarm}` });
	}
	sensorData[floor - 1].fireAlarm = fireAlarm;
	if (fireAlarm) {
		floorTesting[floor - 1] = true;
		const floorUsers = users.filter(u => u.floor === floor);
		floorUsers.forEach(user => {
			sendWarningEmail(user.email, user.name, floor, 'fireAlarm', true, false);
		});
	} else {
		floorTesting[floor - 1] = false;
	}
	res.json({ message: `Fire alarm for floor ${floor} set to ${fireAlarm}` });
});

app.listen(PORT, () => {
	console.log(`Emergency Evacuation System backend running on port ${PORT}`);
});
