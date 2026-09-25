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
    const email = 'toggle_' + Date.now() + '@example.com';
    let res = await request({
      hostname: 'localhost', port: 8080, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Test User', email: email, password: 'password123' });
    
    const token = JSON.parse(res.body).token;

    const { execSync } = require('child_process');
    const cmd = "mysql -u root -pmanager -e \"UPDATE consistency.users SET mobile_number='" + Date.now().toString().slice(0, 10) + "', mobile_verified=1 WHERE email='" + email + "';\"";
    execSync(cmd);

    // Toggle ON
    const toggleOnReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-alerts/settings', method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, { enabled: true, progressThreshold: 50, startTime: '19:00', endTime: '23:00', repeatIntervalMinutes: 60, maxAlertsPerDay: 4 });
    console.log('Toggle ON Status:', toggleOnReq.status);
    
    let dbStatus = execSync("mysql -u root -pmanager -s -N -e \"SELECT enabled FROM consistency.smart_alert_settings ORDER BY id DESC LIMIT 1;\"").toString().trim();
    console.log('DB enabled after ON:', dbStatus);

    // Toggle OFF
    const toggleOffReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-alerts/settings', method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, { enabled: false, progressThreshold: 50, startTime: '19:00', endTime: '23:00', repeatIntervalMinutes: 60, maxAlertsPerDay: 4 });
    console.log('Toggle OFF Status:', toggleOffReq.status);
    
    dbStatus = execSync("mysql -u root -pmanager -s -N -e \"SELECT enabled FROM consistency.smart_alert_settings ORDER BY id DESC LIMIT 1;\"").toString().trim();
    console.log('DB enabled after OFF:', dbStatus);
  } catch (e) {
    console.error(e);
  }
})();
