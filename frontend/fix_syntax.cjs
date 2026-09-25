const fs = require('fs');

// 1. Fix SmartPlan.jsx
let spContent = fs.readFileSync('src/pages/SmartPlan.jsx', 'utf8');
spContent = spContent.replace(/className=\{`card p-6 border flex flex-col items-center justify-center text-center \$\{[\s\S]*?\}\}">/, "className={`card p-6 border flex flex-col items-center justify-center text-center ${plan.workloadStatus === 'HEAVY' ? 'bg-red-50/50 border-red-200' : plan.workloadStatus === 'LIGHT' ? 'bg-blue-50/50 border-blue-200' : 'bg-green-50/50 border-green-200'}`}");
fs.writeFileSync('src/pages/SmartPlan.jsx', spContent);

// 2. Fix Goals.jsx
let gContent = fs.readFileSync('src/pages/Goals.jsx', 'utf8');
gContent = gContent.replace('<span>{goal.daysRemaining === 0 ? "Deadline reached" : Deadline: }</span>', '<span>{goal.daysRemaining === 0 ? "Deadline reached" : `Deadline: ${format(new Date(goal.targetDate), \'MMM d, yyyy\')}`}</span>');
fs.writeFileSync('src/pages/Goals.jsx', gContent);

// 3. Fix api.js
let apiContent = fs.readFileSync('src/services/api.js', 'utf8');
apiContent = apiContent.replace("api.get(date ? /smart-plan?date=${date}` : '/smart-plan')", "api.get(date ? `/smart-plan?date=${date}` : '/smart-plan')");
fs.writeFileSync('src/services/api.js', apiContent);

console.log("Fixed all syntax errors");
