import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { isAuthenticated, loading, role: userRole } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        // Redirect to landing if not authenticated
        return <Navigate to="/" />;
    }

    if (role && role !== userRole) {
        // Redirect if role mismatch (e.g. student trying to access teacher)
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
