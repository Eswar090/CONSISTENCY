const fs = require('fs');

let spContent = fs.readFileSync('src/pages/SmartPlan.jsx', 'utf8');
spContent = spContent.replace("className={`card p-6 border flex flex-col items-center justify-center text-center ${plan.workloadStatus === 'HEAVY' ? 'bg-red-50/50 border-red-200' : plan.workloadStatus === 'LIGHT' ? 'bg-blue-50/50 border-blue-200' : 'bg-green-50/50 border-green-200'}`}", "className={`card p-6 border flex flex-col items-center justify-center text-center ${plan.workloadStatus === 'HEAVY' ? 'bg-red-50/50 border-red-200' : plan.workloadStatus === 'LIGHT' ? 'bg-blue-50/50 border-blue-200' : 'bg-green-50/50 border-green-200'}`}>");
fs.writeFileSync('src/pages/SmartPlan.jsx', spContent);
console.log("Fixed SmartPlan.jsx div closing bracket");
