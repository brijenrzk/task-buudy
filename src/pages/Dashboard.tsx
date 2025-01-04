import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../redux/store';
import { logout } from '../services/firebaseConfig';
import { logoutAction } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../features/auth/userSlice';
import Cookies from 'js-cookie';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);
    const status = useSelector((state: RootState) => state.user.status);
    const [date, setDate] = useState<Date>()

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
            {user ? (<div>
                Welcome , {user.displayName}
                <button onClick={handleLogout}>Logout</button>
                <Drawer>
                    <DrawerTrigger>Add Task</DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Create Task</DrawerTitle>
                            <DrawerDescription>
                                <Input type="text" placeholder="Task Title" />
                                <Input type="text" placeholder="Description" />
                                <Label htmlFor="email">Task Category</Label>
                                <ToggleGroup type="single">
                                    <ToggleGroupItem value="work" aria-label="Toggle work">
                                        Work
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="personal" aria-label="Toggle personal">
                                        Personal
                                    </ToggleGroupItem>

                                </ToggleGroup>
                                <Label htmlFor="em">Due on</Label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            {/* <CalendarIcon /> */}
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Label htmlFor="ema">Task Status</Label>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">TODO</SelectItem>
                                        <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                        <SelectItem value="done">DONE</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Label htmlFor="ema">Attachment</Label>
                                <Input id="picture" type="file" />
                            </DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter>
                            <Button>Submit</Button>
                            <DrawerClose>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

            </div>) : (<p>sign in to dashboard</p>)}



        </div>
    )
}

export default Dashboard