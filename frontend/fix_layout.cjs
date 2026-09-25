const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.jsx', 'utf8');

// Fix the syntax error we just introduced
content = content.replace(/"flex flex-col items-center \$\"\{isActive \? 'text-primary' : 'text-muted-foreground'\}\"\"/g, '\lex flex-col items-center \\');

fs.writeFileSync('src/layouts/MainLayout.jsx', content);
console.log("Fixed MainLayout.jsx");
