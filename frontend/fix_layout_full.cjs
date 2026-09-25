const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.jsx', 'utf8');

// I am just going to put the mobile NavLinks explicitly back to their perfect state
const mobileStart = '<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around h-16 px-2 z-50">';
const mobileEnd = '</nav>';

const properMobileLinks = \
          <NavLink to="/dashboard" className={({isActive}) => \\\lex flex-col items-center justify-center w-full h-full space-y-1 \\\\}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </NavLink>
          <NavLink to="/planner" className={({isActive}) => \\\lex flex-col items-center justify-center w-full h-full space-y-1 \\\\}>
            <CalendarCheck className="h-5 w-5" />
            <span className="text-[10px] font-medium">Plan</span>
          </NavLink>
          <NavLink to="/habits" className={({isActive}) => \\\lex flex-col items-center justify-center w-full h-full space-y-1 \\\\}>
            <ListTodo className="h-5 w-5" />
            <span className="text-[10px] font-medium">Habits</span>
          </NavLink>
          <NavLink to="/focus" className={({isActive}) => \\\lex flex-col items-center justify-center w-full h-full space-y-1 \\\\}>
            <Timer className="h-5 w-5" />
            <span className="text-[10px] font-medium">Focus</span>
          </NavLink>
          <NavLink to="/ai-assistant" className={({isActive}) => \\\lex flex-col items-center justify-center w-full h-full space-y-1 \\\\}>
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px] font-medium">AI</span>
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => \\\lex flex-col items-center justify-center w-full h-full space-y-1 \\\\}>
            <SettingsIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </NavLink>
\;

const startIdx = content.indexOf(mobileStart);
const endIdx = content.lastIndexOf(mobileEnd);

if(startIdx > -1 && endIdx > -1) {
    const newContent = content.substring(0, startIdx + mobileStart.length) + "\\n" + properMobileLinks + "        " + content.substring(endIdx);
    fs.writeFileSync('src/layouts/MainLayout.jsx', newContent);
    console.log("Rewrote mobile nav");
} else {
    console.log("Could not find mobile nav bounds");
}
