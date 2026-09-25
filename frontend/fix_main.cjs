const fs = require('fs');
let content = fs.readFileSync('src/main.jsx', 'utf8');

// If the import is missing, add it right after App.jsx
if (!content.includes('import ErrorBoundary')) {
    content = content.replace("import App from './App.jsx'", "import App from './App.jsx'\nimport ErrorBoundary from './components/ErrorBoundary.jsx'");
}

fs.writeFileSync('src/main.jsx', content);
console.log("Fixed main.jsx");
