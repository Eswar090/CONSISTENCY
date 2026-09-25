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
    const email = 'test_bugs_' + Date.now() + '@example.com';
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

    const spReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/smart-plan', method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Smart Plan:', spReq.status, spReq.body);
    
    const anReq = await request({
      hostname: 'localhost', port: 8080, path: '/api/analytics?startDate=2026-08-27&endDate=2026-09-25', method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('Analytics:', anReq.status, anReq.body);
  } catch (e) {
    console.error(e);
  }
})();
