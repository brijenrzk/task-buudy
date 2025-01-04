import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../redux/store';
import { logout } from '../services/firebaseConfig';
import { logoutAction } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../features/auth/userSlice';
import Cookies from 'js-cookie';

const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const status = useSelector((state: RootState) => state.user.status);

    useEffect(() => {
        if (!user && status !== 'loading') {
            navigate('/'); // If user is not authenticated, navigate to login
        }
    }, [user, status, navigate]);


    const handleLogout = async () => {
        await logout()
        dispatch(clearUser()); // Clear user data from Redux store
        dispatch(logoutAction())
        Cookies.remove('user'); // Clear the user cookie
        navigate('/'); // Redirect to login page after logout
    }

    if (status === 'loading') {
        return <div>Loading...</div>; // Optionally show a loading screen
    }
    return (
        <div>
            dhh
            {user ? (<div>
                Welcome , {user.displayName}
                <button onClick={handleLogout}>Logout</button>
            </div>) : (<p>sign in to dashboard</p>)}

        </div>
    )
}

export default Dashboard