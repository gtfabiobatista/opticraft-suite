import { Bell, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    plan: string;
  };
}

export const Header = ({ user }: HeaderProps) => {
  const mockUser = user || {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Pro'
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Page Title - This will be dynamic based on the current route */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back to Image Optimization
        </p>
      </div>

      {/* Right side - Notifications and User Menu */}
      <div className="flex items-center space-x-4">
        {/* Plan Badge */}
        <Badge 
          variant="secondary" 
          className="bg-gradient-primary text-primary-foreground border-0"
        >
          {mockUser.plan} Plan
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-glow"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">
                  {mockUser.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mockUser.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};