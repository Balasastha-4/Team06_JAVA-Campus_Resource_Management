import { useAuth } from '../context/useAuth';
import StudentDashboard from './StudentDashboard';
import StaffDashboard from './StaffDashboard';
import HODDashboard from './HODDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    const role = user?.roles?.[0];

    if (!role) return <div>Loading...</div>;

    switch (role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'HOD':
            return <HODDashboard />;
        case 'STAFF':
            return <StaffDashboard />;
        case 'STUDENT':
            return <StudentDashboard />;
        default:
            return <div className="p-4">Unknown Role</div>;
    }
};

export default Dashboard;

