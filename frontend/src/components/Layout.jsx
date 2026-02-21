import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = () => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Mobile Sidebar Overlay */}
            {
                isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

            {/* Sidebar Component */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="h-16 lg:hidden glass-effect border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="text-xl font-bold tracking-tight text-slate-900">CRMS</span>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;

