const fs = require('fs');

let appContent = fs.readFileSync('src/App.jsx', 'utf8');

// Insert the new routes right before ai-assistant
const routeStr = '<Route path="goals" element={<Goals />} />\n              <Route path="smart-plan" element={<SmartPlan />} />\n              <Route path="ai-assistant" element={<AIAssistant />} />';

appContent = appContent.replace('<Route path="ai-assistant" element={<AIAssistant />} />', routeStr);
fs.writeFileSync('src/App.jsx', appContent);

console.log("App.jsx routing updated successfully.");
