import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store';

import { useNavigate } from 'react-router-dom';


import Navbar from '@/components/Navbar';
import Header from '@/components/Header';
import TaskView from '@/components/TaskView';
import BoardView from '@/components/BoardView';



const Dashboard = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const status = useSelector((state: RootState) => state.user.status);
    const taskView = useSelector((state: RootState) => state.task.taskView)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<any>();


    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase()); // Normalize for case-insensitive matching
    };


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
                    <Header
                        onSearch={handleSearch}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        onDateChange={setSelectedDate}
                    />
                    {taskView === 'list' ?
                        <TaskView searchQuery={searchQuery} selectedCategory={selectedCategory} selectedDate={selectedDate} />
                        :
                        <BoardView searchQuery={searchQuery} selectedCategory={selectedCategory} selectedDate={selectedDate} />
                    }



                </div>
            ) : (<p>sign in to dashboard</p>)}



        </div>
    )
}

export default Dashboard