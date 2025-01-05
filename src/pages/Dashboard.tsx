import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store';

import { useNavigate } from 'react-router-dom';


import Navbar from '@/components/Navbar';
import Header from '@/components/Header';
import TaskView from '@/components/TaskView';



const Dashboard = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const status = useSelector((state: RootState) => state.user.status);


    useEffect(() => {
        if (!user && status !== 'loading') {
            navigate('/'); // If user is not authenticated, navigate to login
        }
    }, [user, status, navigate]);



    if (status === 'loading') {
        return <div>Loading...</div>; // Optionally show a loading screen
    }
    return (
        <div>
            {user ? (
                <div>
                    <Navbar />
                    <Header />
                    <TaskView />

                </div>
            ) : (<p>sign in to dashboard</p>)}



        </div>
    )
}

export default Dashboard