import { NavLink, useNavigate } from 'react-router-dom';
import { Factory, LayoutDashboard, Package, FolderOpen, Star, Settings, FileText, LogOut, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/api';

const navItems = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/owner/products', icon: Package, label: 'Products' },
  { to: '/owner/categories', icon: FolderOpen, label: 'Categories' },
  { to: '/owner/testimonials', icon: Star, label: 'Testimonials' },
  { to: '/owner/services', icon: Wrench, label: 'Services' },
  { to: '/owner/content', icon: FileText, label: 'Site Content' },
  { to: '/owner/settings', icon: Settings, label: 'Account Settings' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/owner/login');
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-dark-700 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-DEFAULT to-primary-900 flex items-center justify-center shrink-0">
          <Factory size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-heading font-bold text-white text-sm leading-tight whitespace-nowrap">Owner Area</div>
            <div className="text-gray-400 text-xs truncate">{user?.username}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-item-active' : 'admin-nav-item-inactive'} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: collapse toggle + logout */}
      <div className="p-3 border-t border-dark-700 space-y-1">
        <button onClick={handleLogout} className={`admin-nav-item admin-nav-item-inactive w-full text-red-400 hover:bg-red-900/20 hover:text-red-300 ${collapsed ? 'justify-center' : ''}`} title={collapsed ? 'Logout' : undefined}>
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button onClick={onToggle} className={`admin-nav-item admin-nav-item-inactive w-full ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <span className="text-xs">Collapse</span>}
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
