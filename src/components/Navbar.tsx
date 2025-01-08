

import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Task01Icon } from 'hugeicons-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from 'react-router-dom'

import { logout } from '../services/firebaseConfig';
import { logoutAction } from '../features/auth/authSlice';
import { clearUser } from '../features/auth/userSlice';
import Cookies from 'js-cookie';
import { LogOut } from 'lucide-react'

const Navbar = () => {


    const user = useSelector((state: RootState) => state.user.user)
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout()
        dispatch(clearUser()); // Clear user data from Redux store
        dispatch(logoutAction())
        Cookies.remove('user'); // Clear the user cookie
        navigate('/'); // Redirect to login page after logout
    }
    return (
        <div className='flex w-full bg-[#FAEEFC] md:bg-white md:mt-6 h-16 items-center justify-between pl-10 pr-10'>
            <div className='flex items-center gap-2'>
                <Task01Icon color="#7B1984" size={32} className='hidden md:block' />
                <h1 className='text-[#2f2f2f] font-bold'>TaskBuddy</h1>
            </div>
            <div className='flex items-center gap-2'>
                <DropdownMenu>
                    <DropdownMenuTrigger className='flex items-center gap-4'>
                        <img src={user.photoURL} className='h-10 w-10 rounded-full' alt={user.displayName} />
                        <h3 className='hidden md:block'>{user.displayName}</h3>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleLogout}><LogOut />Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>


            </div>

        </div>
    )
}

export default Navbar