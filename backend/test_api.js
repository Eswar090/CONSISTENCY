const http = require('http');

const request = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  try {
    // 1. Register or Login
    let res = await request({
      hostname: 'localhost', port: 8080, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'test@example.com', password: 'password123' });

    if (res.status !== 200) {
      res = await request({
        hostname: 'localhost', port: 8080, path: '/api/auth/register', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { name: 'Test User', email: 'test@example.com', password: 'password123' });
    }
    
    const token = JSON.parse(res.body).token;
    console.log("Token:", token ? "Got token" : "No token");

    // 2. Request OTP
    const otpReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-alerts/phone/request-verification', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, { mobileNumber: '+919652832129' });
    console.log("OTP Request:", otpReq.status, otpReq.body);

    // 3. Try toggling alerts ON
    const toggleReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-alerts/settings', method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, { enabled: true, progressThreshold: 50, startTime: '19:00', endTime: '23:00', repeatIntervalMinutes: 60, maxAlertsPerDay: 4 });
    console.log("Toggle Settings:", toggleReq.status, toggleReq.body);
    
    // 4. Try sending test SMS
    const testSmsReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-alerts/test', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    });
    console.log("Test SMS:", testSmsReq.status, testSmsReq.body);

  } catch (e) {
    console.error(e);
  }
})();
