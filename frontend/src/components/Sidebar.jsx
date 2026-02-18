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
        { name: 'Complaints', path: '/complaints', icon: AlertCircle, roles: ['STUDENT', 'STAFF', 'HOD', 'ADMIN'] }, // Admin also needs to see complaints
        { name: 'Manage Users', path: '/admin/users', icon: Users, roles: ['ADMIN'] },
        // New Links for HOD
        { name: 'Dept. Needs', path: '/department/requirements', icon: ClipboardList, roles: ['HOD'] },
    ];

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <span className="text-xl font-bold text-primary">CRMS</span>
            </div>

            <nav className="p-4 space-y-1">
                {
                    navItems.filter(item => item.roles.includes(role)).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })
                }
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
