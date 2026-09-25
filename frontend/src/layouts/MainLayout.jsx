import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { CalendarCheck, LayoutDashboard, ListTodo, TrendingUp, Timer, LogOut, User, Sparkles, Target, Lightbulb, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/planner", icon: CalendarCheck, label: "Daily Planner" },
    { to: "/habits", icon: ListTodo, label: "Habits" },
    { to: "/focus", icon: Timer, label: "Focus Mode" },
    { to: "/goals", icon: Target, label: "Goals" },
    { to: "/smart-plan", icon: Lightbulb, label: "Smart Plan" },
    { to: "/analytics", icon: TrendingUp, label: "Analytics" },
    { to: "/ai-assistant", icon: Sparkles, label: "AI Assistant", highlight: true },
    { to: "/settings", icon: SettingsIcon, label: "Settings" }
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col justify-between overflow-y-auto transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">CONSISTENCY</h1>
              <p className="text-sm text-muted-foreground mt-1">Plan it. Do it. Track it.</p>
            </div>
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex flex-col gap-2 px-4 pb-4">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setMobileMenuOpen(false)}
                className={({isActive}) => `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'} ${link.highlight && !isActive ? 'text-primary' : ''}`}
              >
                <link.icon className="mr-3 h-5 w-5" />
                {link.label}
              </NavLink>
            ))}
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
          <button onClick={logout} className="btn w-full justify-center">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-primary tracking-tight">CONSISTENCY</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <button onClick={logout} className="text-muted-foreground p-1 rounded-md hover:bg-secondary/50">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
