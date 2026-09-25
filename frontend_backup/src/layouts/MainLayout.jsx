import { Outlet, NavLink } from 'react-router-dom';
import { CalendarCheck, LayoutDashboard, ListTodo, TrendingUp, Timer, LogOut, User, Sparkles, Target, Lightbulb, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">CONSISTENCY</h1>
              <p className="text-sm text-muted-foreground mt-1">Plan it. Do it. Track it.</p>
            </div>
            <NotificationCenter />
          </div>
          
          <nav className="flex flex-col gap-2 pb-4">
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink to="/planner" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <CalendarCheck className="mr-3 h-5 w-5" />
              Daily Planner
            </NavLink>
            <NavLink to="/habits" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <ListTodo className="mr-3 h-5 w-5" />
              Habits
            </NavLink>
            <NavLink to="/focus" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <Timer className="mr-3 h-5 w-5" />
              Focus Mode
            </NavLink>
            <NavLink to="/goals" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <Target className="mr-3 h-5 w-5" />
              Goals
            </NavLink>
            <NavLink to="/smart-plan" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <Lightbulb className="mr-3 h-5 w-5" />
              Smart Plan
            </NavLink>
            <NavLink to="/analytics" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <TrendingUp className="mr-3 h-5 w-5" />
              Analytics
            </NavLink>
            <NavLink to="/ai-assistant" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <Sparkles className="mr-3 h-5 w-5 text-primary" />
              AI Assistant
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>
              <SettingsIcon className="mr-3 h-5 w-5" />
              Settings
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
              <User className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="text-xl font-bold text-primary tracking-tight">CONSISTENCY</h1>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <button onClick={logout} className="text-muted-foreground p-1 rounded-md hover:bg-secondary/50">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around h-16 px-1 z-50 overflow-x-auto">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        <NavLink to="/planner" className={({isActive}) => `flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <CalendarCheck className="h-5 w-5" />
          <span className="text-[10px] font-medium">Plan</span>
        </NavLink>
        <NavLink to="/habits" className={({isActive}) => `flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <ListTodo className="h-5 w-5" />
          <span className="text-[10px] font-medium">Habits</span>
        </NavLink>
        <NavLink to="/focus" className={({isActive}) => `flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Timer className="h-5 w-5" />
          <span className="text-[10px] font-medium">Focus</span>
        </NavLink>
        <NavLink to="/analytics" className={({isActive}) => `flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <TrendingUp className="h-5 w-5" />
          <span className="text-[10px] font-medium">Stats</span>
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <SettingsIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MainLayout;
