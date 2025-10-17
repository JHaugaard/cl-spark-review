import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InviteReviewerDialog } from '@/components/invitation/InviteReviewerDialog';
import { FolderOpen, UserPlus, Heart, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isOwner = role === 'owner';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/galleries')}
            >
              <img src={logo} alt="Collected Light" className="h-10 w-auto" />
              <h1 className="text-xl font-bold text-slate-900">
                Collected Light Review
              </h1>
            </div>
            
            {user && (
              <nav className="flex items-center gap-2">
                {role === 'owner' && (
                  <Button
                    variant={location.pathname.startsWith('/dashboard') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                )}
                
                <Button
                  variant={location.pathname.startsWith('/galleries') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/galleries')}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Galleries
                </Button>
                
                {role === 'reviewer' && (
                  <Button
                    variant={location.pathname === '/selections' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate('/selections')}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    My Selections
                  </Button>
                )}
              </nav>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-4">
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteDialogOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Reviewer
                </Button>
              )}
              
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                  {role && (
                    <Badge variant={isOwner ? 'default' : 'secondary'} className="text-xs">
                      {role}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-200"
              >
                Sign out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>
      
      {isOwner && (
        <InviteReviewerDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
        />
      )}
    </div>
  );
};

export default Layout;
