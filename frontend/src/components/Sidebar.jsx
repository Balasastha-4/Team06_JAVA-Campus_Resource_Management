import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    AlertCircle,
    LogOut,
    Building2,
    ClipboardList
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const role = user?.roles?.[0];

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'STAFF', 'ADMIN', 'HOD'] },
        { name: 'Resources', path: '/resources', icon: Building2, roles: ['STUDENT', 'STAFF', 'ADMIN', 'HOD'] },
        { name: 'Library', path: '/library', icon: BookOpen, roles: ['STUDENT', 'STAFF', 'ADMIN', 'HOD'] },
        { name: 'Events', path: '/events', icon: Calendar, roles: ['STUDENT', 'STAFF', 'ADMIN', 'HOD'] },
        { name: 'Complaints', path: '/complaints', icon: AlertCircle, roles: ['STUDENT', 'STAFF', 'HOD', 'ADMIN'] },
        { name: 'Manage Users', path: '/admin/users', icon: Users, roles: ['ADMIN'] },
        { name: 'Dept. Needs', path: '/department/requirements', icon: ClipboardList, roles: ['HOD'] },
    ];

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 glass-effect border-r border-slate-200/50 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="h-20 flex items-center px-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Building2 className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">CRMS</span>
                </div>
            </div>

            <nav className="p-6 space-y-2">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
                {
                    navItems.filter(item => item.roles.includes(role)).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                {item.name}
                                {isActive && (
                                    <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
                                )}
                            </Link>
                        );
                    })
                }
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-slate-100/50 rounded-2xl p-4 mb-4 border border-slate-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-bold shadow-sm border border-slate-100">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs font-medium text-slate-500 truncate">{role}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:gap-3"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
