import AddTask from '@/components/AddTask';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Input } from './ui/input';
import { Search01Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { Calendar1Icon, List, SquareKanban } from 'lucide-react';
import { useMediaQuery } from 'react-responsive'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { taskViewAction } from '@/features/task/taskSlice';



interface HeaderProps {
    onSearch: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onDateChange: (date: object) => void;
}


const Header: React.FC<HeaderProps> = ({ onSearch, onCategoryChange, onDateChange }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);
        onSearch(query); // Emit the search query to the parent
    };
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    })
    const [category, setCategory] = useState('all')
    const isDesktop = useMediaQuery({ query: '(min-width: 1224px)' })
    const dispatch = useDispatch<AppDispatch>()
    const taskView = useSelector((state: RootState) => state.task.taskView)


    useEffect(() => {
        onCategoryChange(category)

    }, [category])
    useEffect(() => {
        if (date) {
            onDateChange(date)
        }
    }, [date])

    const handleListView = (taskView: string) => {
        dispatch(taskViewAction(taskView))
        setSearchQuery('')
        setCategory('all')
        setDate(undefined)
    }


    if (isDesktop) {
        return (
            <div className='flex flex-col px-10 pt-4'>
                <div className='flex gap-8'>
                    <Button onClick={() => handleListView('list')}
                        className={`bg-white text-gray-600 !shadow-none text-lg rounded-none p-0  hover:bg-white ${taskView === 'list' ? 'border-b-2 border-black text-black font-semibold' : ''
                            }`}>
                        <List />List</Button>
                    <Button onClick={() => handleListView('board')}
                        className={`bg-white text-gray-600 !shadow-none text-lg rounded-none p-0  hover:bg-white ${taskView === 'board' ? 'border-b-2 border-black text-black font-semibold' : ''
                            }`}
                    ><SquareKanban />Board</Button>

                </div>

                <div className='mt-8 gap-4 flex flex-row w-full justify-between'>
                    <div className='flex gap-4 items-center'>
                        <Label htmlFor="ema" className='text-gray-500'>Filter by:</Label>
                        <div className='flex gap-4'>
                            <Select onValueChange={setCategory} value={category}>
                                <SelectTrigger className="w-[140px] rounded-full">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="work">Work</SelectItem>
                                    <SelectItem value="personal">Personal</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-auto rounded-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar1Icon />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y")} -{" "}
                                                    {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Due Date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                    </div>
                    <div className='flex items-center gap-8'>
                        <div className='w-[500px] '>
                            <div className='relative flex items-center bg-[#FBFBFB] border border-black p-2 pl-5 rounded-full'>
                                <Search01Icon className='absolute' size={19} color='grey' />
                                <Input type='search' placeholder='Search' value={searchQuery}
                                    onChange={handleSearchChange} className='border-0 shadow-none focus-visible:ring-0 active:border-none pl-10' />
                            </div>
                        </div>




                        <div className='flex flex-1 justify-end'>
                            <AddTask />
                        </div>

                    </div>

                </div>
            </div>
        )
    }

    //mobile
    return (
        <div className='px-6 mt-8 gap-4 flex flex-col w-full'>
            <div className='flex flex-1 justify-end'>
                <AddTask />
            </div>

            <div className='flex flex-col gap-4'>
                <Label htmlFor="ema" className='text-gray-500'>Filter by:</Label>
                <div className='flex gap-4'>
                    <Select onValueChange={setCategory}>
                        <SelectTrigger className="w-[140px] rounded-full">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-auto rounded-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <Calendar1Icon />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Due Date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

            </div>
            <div>
                <div className='relative flex items-center bg-[#FBFBFB] p-2 rounded-full'>
                    <Search01Icon className='absolute' size={19} color='grey' />
                    <Input type='search' placeholder='Search' value={searchQuery}
                        onChange={handleSearchChange} className='border-0 shadow-none focus-visible:ring-0 active:border-none pl-10' />
                </div>
            </div>
        </div>
    )
}

export default Header