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
    const email = 'test' + Date.now() + '@example.com';
    let res = await request({
      hostname: 'localhost', port: 8080, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Test User', email: email, password: 'password123' });
    
    if (res.status !== 200 && res.status !== 201) {
      console.log('Register failed:', res.body);
      return;
    }
    const token = JSON.parse(res.body).token;
    console.log('Token acquired.');

    const { execSync } = require('child_process');
    const cmd = "mysql -u root -pmanager -e \"UPDATE consistency.users SET mobile_number='" + Date.now().toString().slice(0, 10) + "', mobile_verified=1 WHERE email='" + email + "';\"";
    execSync(cmd);
    console.log('Phone verified in DB.');

    const toggleReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-alerts/settings', method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, { enabled: true, progressThreshold: 50, startTime: '19:00', endTime: '23:00', repeatIntervalMinutes: 60, maxAlertsPerDay: 4 });
    console.log('Toggle Settings:', toggleReq.status, toggleReq.body);
    
    const testSmsReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-alerts/test', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    });
    console.log('Test SMS:', testSmsReq.status, testSmsReq.body);
  } catch (e) {
    console.error(e);
  }
})();
