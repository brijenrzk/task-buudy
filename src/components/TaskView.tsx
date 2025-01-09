import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { IoIosCheckmarkCircle, IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useRef, useState } from "react";
import { addTaskToFirestore, deleteTasksFromFirestore, fetchTasksFromFirestore, modalAction, sortTaskAction, updateBulkTaskStatusInFirestore, updateTaskStatusInFirestore } from "@/features/task/taskSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Cookies from 'js-cookie';
import { Button } from "./ui/button";
import ViewTask from "./ViewTask";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis, Plus } from "lucide-react";
import { cn, formatCustomDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MdOutlineDragIndicator } from "react-icons/md";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { useAuth } from "@/hooks/useAuth";
interface TaskViewProps {
    searchQuery: string;
    selectedCategory: string;
    selectedDate: any;
}




const TaskView: React.FC<TaskViewProps> = ({ searchQuery, selectedCategory, selectedDate }) => {
    const { toast } = useToast()
    const dispatch = useDispatch<AppDispatch>();
    const { tasks, loading }: { tasks: any, loading: boolean } = useSelector((state: RootState) => state.task);
    const userCookie = Cookies.get('user')
    const [inProgressTasks, setInProgressTasks] = useState(tasks.filter((task: any) => task.taskStatus === 'progress'))
    const [todoTasks, setTodoTasks] = useState(tasks.filter((task: any) => task.taskStatus === 'todo'))
    const [completedTasks, setCompletedTasks] = useState(tasks.filter((task: any) => task.taskStatus === 'completed'))
    const [selectedTasks, setSelectedTasks] = useState<(any)[]>([])
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const { sort } = useSelector((state: RootState) => state.task)
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
    const [taskStatus, setTaskStatus] = useState('');
    const [titleError, setTitleError] = useState<boolean>(false)
    const [categoryError, setCategoryError] = useState<boolean>(false)
    const [dateError, setDateError] = useState<boolean>(false)
    const [statusError, setStatusError] = useState<boolean>(false)
    const { user } = useAuth();
    const [addOpen, setAddOpen] = useState<boolean>(false)
    const filteredTasks = tasks.filter((task: any) => {
        const matchesSearchQuery = searchQuery
            ? task.title.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
        const matchesDate =
            selectedDate?.from && selectedDate?.to
                ? new Date(task.dueDate) >= new Date(selectedDate.from) &&
                new Date(task.dueDate) <= new Date(selectedDate.to)
                : true;
        return matchesSearchQuery && matchesCategory && matchesDate;
    });

    useEffect(() => {
        if (userCookie) {
            const usr = JSON.parse(userCookie)
            const userId = usr.uid
            dispatch(fetchTasksFromFirestore(userId));
        }
    }, []);




    useEffect(() => {
        setTodoTasks(filteredTasks.filter((task: any) => task.taskStatus === 'todo'))
        setInProgressTasks(filteredTasks.filter((task: any) => task.taskStatus === 'progress'))
        setCompletedTasks(filteredTasks.filter((task: any) => task.taskStatus === 'completed'))
    }, [searchQuery, selectedCategory, selectedDate])


    useEffect(() => {
        if (!loading) {
            setTodoTasks(tasks.filter((task: any) => task.taskStatus === 'todo'))
            setInProgressTasks(tasks.filter((task: any) => task.taskStatus === 'progress'))
            setCompletedTasks(tasks.filter((task: any) => task.taskStatus === 'completed'))
        }

    }, [loading, sort, tasks])

    const taskRef = useRef()
    const taskContainer = useRef()

    const handleOnDrag = (e: any, id: any, taskStatus: any) => {
        e.target.style.opacity = 0.5
        taskRef.current = id
        taskContainer.current = taskStatus
    }
    const handleDragEnd = (e: any,) => {
        e.target.style.opacity = 1
    }
    const handleOnDrop = (container: string) => {
        let sourceContainer = taskContainer.current
        if (sourceContainer === container) {
            return
        }
        switch (container) {
            case 'todo':

                setTodoTasks((prev: any) => [...prev, currentTask])
                break;
            case 'progress':
                setInProgressTasks((prev: any) => [...prev, currentTask])
                break;
            case 'completed':
                setCompletedTasks((prev: any) => [...prev, currentTask])
        }
        if (sourceContainer) {
            switch (sourceContainer) {
                case 'todo':
                    setTodoTasks(todoTasks.filter((task: any) => task.id != taskRef.current))
                    break;
                case 'progress':
                    setInProgressTasks(inProgressTasks.filter((task: any) => task.id != taskRef.current))
                    break;
                case 'completed':
                    setCompletedTasks(completedTasks.filter((task: any) => task.id != taskRef.current))
                    break;
            }
        }

        let currentTask: any = tasks.find((task: any) => task.id == taskRef.current)
        if (taskRef.current) {
            const currentDate = new Date().toISOString()
            let updatedHistory = [...currentTask.taskHistory, { activity: `You Change the type status from ${taskContainer.current} to ${container}`, timestamp: currentDate }]
            dispatch(updateTaskStatusInFirestore({ id: taskRef.current, taskStatus: container, taskHistory: updatedHistory }))
        }
    }
    const handleOnDragOver = (e: any) => {
        e.preventDefault();
    }

    const handleSelectTask = (e: any, task: any, taskId: string | undefined) => {
        if (e === true && task.id) {
            setSelectedTasks((prev) => [...prev, task])
        } else {
            let newSelectedTask = selectedTasks.filter((task) => task.id != taskId)
            setSelectedTasks(newSelectedTask)
        }
    }

    const handleDeleteTask = (task: any) => {
        dispatch(deleteTasksFromFirestore([task]));
        toast({
            title: "Task Deleted",
        })
    }

    const handleBulkDelete = () => {
        if (selectedTasks) {
            dispatch(deleteTasksFromFirestore(selectedTasks));
            setSelectedTasks([])
            toast({
                title: "Tasks Deleted",
            })
        }

    }
    useEffect(() => {
    }, [tasks]);

    const handleUpdateTaskStatus = (e: any, task: any) => {

        if (selectedTasks) {
            dispatch(updateBulkTaskStatusInFirestore({ selectedTasks: [task], taskStatus: e }));
        }
    }

    const handleBulkUpdateTaskStatus = (e: any) => {

        if (selectedTasks) {
            dispatch(updateBulkTaskStatusInFirestore({ selectedTasks: selectedTasks, taskStatus: e }));
            setSelectedTasks([])
            toast({
                title: "Tasks Status Updated.",
            })
        }
    }
    const handleModalOpen = (task: any) => {
        setSelectedTask(task);
        dispatch(modalAction(true))
        console.log(isModalOpen)
        setIsModalOpen(true)
    }
    const sortTask = () => {

        if (sort === "asc") {
            dispatch(sortTaskAction("des"))
        } else {
            dispatch(sortTaskAction("asc"))
        }

    }

    const handleSubmit = async () => {
        if (title.trim() == '') {
            setTitleError(true)
            return;
        } else { setTitleError(false) }

        if (dueDate == undefined) {
            setDateError(true)
            return;
        } else { setStatusError(false) }
        if (taskStatus.trim() == '') {
            setStatusError(true)
            return;
        } else { setStatusError(false) }
        if (category.trim() == '') {
            setCategoryError(true)
            return;
        } else { setCategoryError(false) }
        if (!user) {
            return;
        }
        const taskDueDate = dueDate
        const currentDate = new Date().toISOString()
        const task = {
            title,
            description: '',
            category,
            dueDate: new Date(taskDueDate).toISOString(),
            taskStatus,
            fileUrl: [],
            userId: user.uid,
            taskHistory: [{ activity: "You Created this task", timestamp: currentDate }]
        };

        try {
            await dispatch(addTaskToFirestore(task))
        } catch (error) {
            console.error('Failed to add task: ', error);
        }
        closeAddOpen()
        toast({
            title: "Task Created Sucessfully.",
        })
    }
    const closeAddOpen = () => {
        setAddOpen(false)
        setTitle('')
        setCategory('')
        setDueDate(undefined)
        setTaskStatus('')
        setTitleError(false)
        setCategoryError(false)
        setDateError(false)
        setStatusError(false)
    }

    return (
        <div className='px-8 flex flex-col gap-5 mt-5 md:mt-8'>
            <Table className="hidden md:table border-t">
                <TableHeader>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="md:w-[40%]">Task Name</TableHead>

                    <TableHead className="w-[150px] cursor-pointer flex items-center" onClick={sortTask}>Due on{sort === "asc" ? <IoMdArrowDropdown /> : <IoMdArrowDropup />}</TableHead>
                    <TableHead className="w-[20%] text-left">Task Status</TableHead>
                    <TableHead className=" w-[8%]">Task Category</TableHead>
                    <TableHead></TableHead>
                    <TableHead className=""></TableHead>
                    <TableHead className=""></TableHead>
                    <TableHead className=""></TableHead>
                    <TableHead className=""></TableHead>
                </TableHeader>
            </Table>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#FAC3FF] rounded-t-2xl px-4 font-bold'>Todo ({todoTasks.length})</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("todo")} onDragOver={(e) => handleOnDragOver(e)}>
                        <div className="pl-20 flex-row w-full h-14 items-center bg-gray-100 border-b hidden lg:flex"><div className="flex items-center cursor-pointer" onClick={() => setAddOpen(true)}><Plus className="text-[#7B1984] mr-2" /><p>ADD TASK</p></div></div>

                        {addOpen &&
                            <div className="pl-20 flex-row w-full h-32 items-center bg-gray-100 border-b gap-28 hidden lg:flex">
                                <div className="flex flex-col gap-4 w-[33%]">
                                    <Input type="text" value={title} placeholder="Task title" className={`shadow-none mt-2 h-12 ${titleError && "border-red-500"}`} onChange={(e) => setTitle(e.target.value)} />
                                    <div className="flex">
                                        <Button className='w-28 rounded-full bg-[#7B1984] hover:bg-[#7b1984bb]' onClick={handleSubmit}>
                                            {loading ? <div className="w-4 h-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                :
                                                <>Create</>
                                            }
                                        </Button>
                                        <Button variant="outline" onClick={closeAddOpen} className='w-28 rounded-full'>Cancel</Button>
                                    </div>

                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal shadow-none bg-gray-100",
                                                !dueDate && "text-muted-foreground",
                                                dateError && "!border-red-500"
                                            )}
                                        >
                                            {/* <CalendarIcon /> */}
                                            {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dueDate}
                                            onSelect={setDueDate}
                                            initialFocus

                                        />
                                    </PopoverContent>
                                </Popover>
                                <Select onValueChange={setTaskStatus}>
                                    <SelectTrigger className={`w-[180px]  shadow-none ${statusError && "border-red-500"}`} >
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">TODO</SelectItem>
                                        <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                        <SelectItem value="completed">DONE</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={setCategory}>
                                    <SelectTrigger className={`w-[180px]  shadow-none ${categoryError && "border-red-500"}`} >
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="work">Work</SelectItem>
                                        <SelectItem value="personal">Personal</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        }
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody className="w-full">
                                {todoTasks.length < 1 && <div className="h-20 flex justify-center items-center"><p className="text-lg">No Tasks in To-Do</p></div>}
                                {todoTasks.map((task: any) => (
                                    <TableRow className='h-16 items-center cursor-pointer' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className="w-[50px] text-center ">
                                            <Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' onCheckedChange={(e) => handleSelectTask(e, task, task.id)} />

                                        </TableCell>
                                        <TableCell className="w-[50px]"><MdOutlineDragIndicator /></TableCell>
                                        <TableCell className="w-[50px]"><IoIosCheckmarkCircle size={20} className='text-gray-400' /></TableCell>

                                        <TableCell className="w-auto md:w-[40%]" onClick={() => handleModalOpen(task)}>{task.title}</TableCell>
                                        <TableCell className="hidden md:table-cell w-[250px] " onClick={() => handleModalOpen(task)}>{formatCustomDate(task.dueDate)}</TableCell>

                                        <TableCell className="hidden md:table-cell text-left w-[20%]">
                                            <Select onValueChange={(e) => handleUpdateTaskStatus(e, task)} value={task.taskStatus}>
                                                <SelectTrigger className="shadow-none text-black bg-gray-200 rounded-full w-[55%]">
                                                    <SelectValue placeholder="Status" /> </SelectTrigger>
                                                <SelectContent side="top">
                                                    <SelectItem value="todo">TODO</SelectItem>
                                                    <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                                    <SelectItem value="completed">DONE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-left w-[8%]">{task.category}</TableCell>
                                        <TableCell className="hidden md:table-cell text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger><Ellipsis /></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleModalOpen(task)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteTask(task)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>

                                    </TableRow>
                                ))}


                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#85D9F1] rounded-t-2xl px-4 font-bold'>In-Progress ({inProgressTasks.length})</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("progress")} onDragOver={(e) => handleOnDragOver(e)}>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody className="w-full" >
                                {inProgressTasks.length < 1 && <div className="h-20 flex justify-center items-center"><p className="text-lg">No Tasks in In Progress</p></div>}
                                {inProgressTasks.map((task: any) => (
                                    <TableRow className='h-16 items-center cursor-pointer' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className="w-[50px] text-center "><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' onCheckedChange={(e) => handleSelectTask(e, task, task.id)} /></TableCell>
                                        <TableCell className="w-[50px]"><IoIosCheckmarkCircle size={20} className='text-gray-400' /></TableCell>

                                        <TableCell className="w-auto md:w-[40%]" onClick={() => handleModalOpen(task)}>{task.title}</TableCell>
                                        <TableCell className="hidden md:table-cell w-[250px] " onClick={() => handleModalOpen(task)}>{formatCustomDate(task.dueDate)}</TableCell>

                                        <TableCell className="hidden md:table-cell text-left w-[20%]">
                                            <Select onValueChange={(e) => handleUpdateTaskStatus(e, task)} value={task.taskStatus}>
                                                <SelectTrigger className="shadow-none text-black bg-gray-200 rounded-full w-[55%]">
                                                    <SelectValue placeholder="Status" /> </SelectTrigger>
                                                <SelectContent side="top">
                                                    <SelectItem value="todo">TODO</SelectItem>
                                                    <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                                    <SelectItem value="completed">DONE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-left w-[8%]">{task.category}</TableCell>
                                        <TableCell className="hidden md:table-cell text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger><Ellipsis /></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleModalOpen(task)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteTask(task)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>

                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#CEFFCC] rounded-t-2xl px-4 font-bold'>Completed ({completedTasks.length})</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("completed")} onDragOver={(e) => handleOnDragOver(e)}>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody className="w-full">
                                {completedTasks.length < 1 && <div className="h-20 flex justify-center items-center"><p className="text-lg">No Tasks in Done</p></div>}
                                {completedTasks.map((task: any) => (
                                    <TableRow className='h-16 items-center cursor-pointer' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className="w-[50px] text-center "><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' onCheckedChange={(e) => handleSelectTask(e, task, task.id)} /></TableCell>
                                        <TableCell className="w-[50px]"><IoIosCheckmarkCircle size={20} className='text-[#1B8D17]' /></TableCell>

                                        <TableCell className="w-auto md:w-[40%] line-through" onClick={() => handleModalOpen(task)}>{task.title}</TableCell>
                                        <TableCell className="hidden md:table-cell w-[250px] " onClick={() => handleModalOpen(task)}>{formatCustomDate(task.dueDate)}</TableCell>

                                        <TableCell className="hidden md:table-cell text-left w-[20%]">
                                            <Select onValueChange={(e) => handleUpdateTaskStatus(e, task)} value={task.taskStatus}>
                                                <SelectTrigger className="shadow-none text-black bg-gray-200 rounded-full w-[55%]">
                                                    <SelectValue placeholder="Status" /> </SelectTrigger>
                                                <SelectContent side="top">
                                                    <SelectItem value="todo">TODO</SelectItem>
                                                    <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                                    <SelectItem value="completed">DONE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-left w-[8%]">{task.category}</TableCell>
                                        <TableCell className="hidden md:table-cell text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger><Ellipsis /></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleModalOpen(task)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteTask(task)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>

                                    </TableRow>
                                )

                                )}

                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {
                selectedTasks.length > 0 &&
                <div className="fixed flex bottom-8 h-20 w-[90%] md:w-[40%] bg-[#1A1C20] left-[50%] translate-x-[-50%] rounded-xl shadow-md px-4 items-center justify-between">
                    <div className="border border-white w-[35%] h-10 rounded-full flex items-center justify-center">
                        <p className="text-white font-bold text-[0.6em] lg:text-base">{selectedTasks.length} Tasks Selected</p>
                    </div>
                    <div className="flex gap-2 justify-end w-[65%]">
                        <Select onValueChange={(e) => handleBulkUpdateTaskStatus(e)}>
                            <SelectTrigger className="w-[45%] md:w-[35%]  shadow-none text-white rounded-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent side="top">
                                <SelectItem value="todo">TODO</SelectItem>
                                <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                <SelectItem value="completed">DONE</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="w-[45%] md:w-[35%] border border-[#E13838] rounded-full text-[#E13838] bg-[#e1383834]" onClick={handleBulkDelete}>
                            Delete
                        </Button>
                    </div>

                </div>
            }
            {
                selectedTask && (
                    <ViewTask task={selectedTask} />
                )
            }


        </div >
    )
}

export default TaskView