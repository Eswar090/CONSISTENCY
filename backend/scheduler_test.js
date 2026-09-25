const http = require('http');

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

(async () => {
  const ts = Date.now();
  const email = 'schedtest_' + ts + '@example.com';
  
  // 1. Register and get token
  let res = await request({ hostname:'localhost', port:8080, path:'/api/auth/register', method:'POST', headers:{'Content-Type':'application/json'} },
    { name:'Scheduler Test User', email, password:'password123' });
  const token = res.json.token;
  const headers = { 'Content-Type':'application/json', 'Authorization':'Bearer '+token };

  const trigger = async (name) => {
    console.log(`\n--- TEST: ${name} ---`);
    let r = await request({ hostname:'localhost', port:8080, path:'/api/smart-alerts/dev/trigger', method:'POST', headers });
    console.log(r.body);
    return r.json;
  };

  // Case 2: Phone unverified
  await trigger('Phone Unverified');

  // Verify Phone manually via DB (to bypass SMS flow for tests)
  const { execSync } = require('child_process');
  const phone = '+91900' + String(ts).slice(-7);
  execSync(`mysql -u root -pmanager -e "UPDATE consistency.users SET mobile_number='${phone}', mobile_verified=1 WHERE email='${email}'"`);

  // Case 1: Alerts OFF (default)
  await trigger('Alerts OFF');

  // Enable Alerts
  await request({ hostname:'localhost', port:8080, path:'/api/smart-alerts/settings', method:'PUT', headers }, { enabled: true, progressThreshold: 50, startTime: '00:00', endTime: '23:59', repeatIntervalMinutes: 60, maxAlertsPerDay: 4 });
  
  // Case 7: No meaningful work remains (new user has 0 tasks, 0 habits)
  await trigger('No Work Remains');

  // Create a pending Task so work remains
  let taskRes = await request({ hostname:'localhost', port:8080, path:'/api/tasks', method:'POST', headers }, { title: 'Test task', priority: 'HIGH', plannedDate: new Date().toISOString().split('T')[0] });
  let taskId = taskRes.json.id;

  // Case 4: Progress < 50% + work remains (Should SEND SMS)
  let t4 = await trigger('Progress < 50% + Work Remains (EXPECT MOCK SMS)');
  
  if (t4.alertSent) {
    // Case 5: Repeat interval
    await trigger('Repeat Interval Block (Run again immediately)');

    // Simulate time passing (backdate the last alert by 65 minutes)
    execSync(`mysql -u root -pmanager -e "UPDATE consistency.smart_alert_history SET sent_at = DATE_SUB(NOW(), INTERVAL 65 MINUTE)"`);
    
    // Create 3 more historical alerts today to hit the max limit of 4
    for (let i=0; i<3; i++) {
        execSync(`mysql -u root -pmanager -e "INSERT INTO consistency.smart_alert_history (user_id, alert_date, sent_at, message_type, slot_time, created_at, progress_percentage, remaining_tasks, remaining_habits) VALUES ((SELECT id FROM consistency.users WHERE email='${email}'), CURDATE(), DATE_SUB(NOW(), INTERVAL ${65 + i*60} MINUTE), 'ALERT', '10:00:0${i}', NOW(), 0, 1, 0)"`);
    }

    // Case 6: Max alerts per day reached
    await trigger('Max Alerts Per Day (4 alerts already)');
  }

  // Set progress >= 50% by completing the task
  await request({ hostname:'localhost', port:8080, path:`/api/tasks/${taskId}/complete`, method:'PUT', headers });
  
  // Case 3: Progress >= threshold (100% now)
  await trigger('Progress >= 50%');

  // Set window outside current time
  await request({ hostname:'localhost', port:8080, path:'/api/smart-alerts/settings', method:'PUT', headers }, { startTime: '03:00', endTime: '04:00' });
  
  // Case 8: Outside configured window
  await trigger('Outside Time Window');

  console.log('\n✅ All tests complete');

})();
