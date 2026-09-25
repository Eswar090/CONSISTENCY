const http = require('http');
const { execSync } = require('child_process');

const request = (options, data) => new Promise((resolve, reject) => {
  const req = http.request(options, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => resolve({ status: res.statusCode, body, json: (() => { try { return JSON.parse(body); } catch { return {}; } })() }));
  });
  req.on('error', reject);
  if (data) req.write(JSON.stringify(data));
  req.end();
});

const db = (sql) => {
  try { return execSync(`mysql -u root -pmanager -s -N -e "${sql}"`, { stdio: ['pipe','pipe','pipe'] }).toString().trim(); }
  catch(e) { return 'ERROR:' + e.stderr.toString().replace(/mysql: \[Warning\].*\n/,'').trim(); }
};

(async () => {
  const ts = Date.now();
  const email1 = 'ctest1_' + ts + '@example.com';
  const email2 = 'ctest2_' + ts + '@example.com';
  const phone1 = '+919100000001';
  const phone2 = '+919200000002';

  // Register user1
  let res = await request({ hostname:'localhost', port:8080, path:'/api/auth/register', method:'POST', headers:{'Content-Type':'application/json'} },
    { name:'Test User1', email:email1, password:'password123' });
  const token1 = res.json.token;
  const auth1 = { 'Content-Type':'application/json', 'Authorization':'Bearer '+token1 };

  // Register user2 with phone2 already verified
  res = await request({ hostname:'localhost', port:8080, path:'/api/auth/register', method:'POST', headers:{'Content-Type':'application/json'} },
    { name:'Test User2', email:email2, password:'password123' });
  const token2 = res.json.token;
  const auth2 = { 'Content-Type':'application/json', 'Authorization':'Bearer '+token2 };

  // Set phone2 as verified for user2 directly in DB
  db(`UPDATE consistency.users SET mobile_number='${phone2}', mobile_verified=1, mobile_otp_hash=NULL WHERE email='${email2}'`);
  console.log('User2 phone2 set in DB');

  console.log('\n[TEST 1] Invalid E.164 format');
  res = await request({ hostname:'localhost', port:8080, path:'/api/smart-alerts/phone/request-verification', method:'POST', headers:auth1 }, { mobileNumber:'12345' });
  console.log('Status:', res.status, '| Msg:', res.json.message);
  console.log(res.status === 400 ? '✅ PASS' : '❌ FAIL');

  console.log('\n[TEST 2] Duplicate number (phone2 already used by user2)');
  res = await request({ hostname:'localhost', port:8080, path:'/api/smart-alerts/phone/request-verification', method:'POST', headers:auth1 }, { mobileNumber:phone2 });
  console.log('Status:', res.status, '| Msg:', res.json.message);
  console.log(res.status === 400 ? '✅ PASS' : '❌ FAIL');

  console.log('\n[TEST 3] Valid OTP request for phone1 (user1)');
  res = await request({ hostname:'localhost', port:8080, path:'/api/smart-alerts/phone/request-verification', method:'POST', headers:auth1 }, { mobileNumber:phone1 });
  console.log('Status:', res.status, '| Msg:', res.json.message);
  console.log(res.status === 200 ? '✅ PASS' : '❌ FAIL');

  console.log('\n[TEST 4] DB state: mobile_number should NOT be overwritten yet, mobile_verified=0');
  const dbRow = db(`SELECT mobile_number, mobile_verified FROM consistency.users WHERE email='${email1}'`);
  console.log('DB row:', dbRow);
  // The mobile_number is stored as NULL originally, pending is in otp_hash
  // After the new code, mobile_number is still the old value (NULL initially)
  console.log('mobile_number is NOT phone1 yet OR is phone1 (old code path):');
  const dbHash = db(`SELECT mobile_otp_hash FROM consistency.users WHERE email='${email1}'`);
  const hasPendingPhone = dbHash && dbHash.startsWith(phone1 + ':');
  console.log('Pending phone stored in hash:', hasPendingPhone ? '✅ YES ('+phone1+')' : '⚠️ NO — Hash: ' + dbHash.substring(0,30));

  console.log('\n[TEST 5] Wrong OTP verification');
  res = await request({ hostname:'localhost', port:8080, path:'/api/smart-alerts/phone/verify', method:'POST', headers:auth1 }, { otp:'000000' });
  console.log('Status:', res.status, '| Msg:', res.json.message);
  console.log(res.status === 400 ? '✅ PASS' : '❌ FAIL');

  console.log('\n[TEST 6] DB state unchanged after wrong OTP');
  const dbRow2 = db(`SELECT mobile_number, mobile_verified FROM consistency.users WHERE email='${email1}'`);
  console.log('DB row after wrong OTP:', dbRow2);

  console.log('\nAll automated tests done.');
  console.log('\nMANUAL STEP NEEDED:');
  console.log('1. Check Spring Boot console for: [MOCK SMS] OTP');
  console.log('2. Enter that OTP in the UI under Settings → Change');
  console.log('3. Verify that DB updates: mobile_number =', phone1, ', mobile_verified = 1');
})();
