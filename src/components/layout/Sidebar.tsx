import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Image, 
  Layers, 
  Key, 
  Settings, 
  History,
  Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Single Image', href: '/optimize', icon: Image },
  { name: 'Batch Processing', href: '/batch', icon: Layers },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  
  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border bg-gradient-primary">
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-primary-foreground" />
          <span className="text-xl font-bold text-primary-foreground">
            ImageOpt
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href === '/' && location.pathname === '/');
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-gradient-subtle p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Check our{' '}
            <a href="#" className="text-primary hover:underline">
              documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};