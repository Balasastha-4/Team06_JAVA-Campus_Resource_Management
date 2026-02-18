import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className ="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
                <p className ="text-gray-600 mb-8">You do not have permission to access this page.</p>
                    <Link to ="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
    );
};

export default Unauthorized;

