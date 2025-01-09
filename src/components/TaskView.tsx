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
import { deleteTasksFromFirestore, fetchTasksFromFirestore, modalAction, sortTaskAction, updateBulkTaskStatusInFirestore, updateTaskStatusInFirestore } from "@/features/task/taskSlice";
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
import { Ellipsis } from "lucide-react";
import { formatCustomDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MdOutlineDragIndicator } from "react-icons/md";
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
        // Trigger a re-render when tasks change
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

        setIsModalOpen(true)
    }
    const sortTask = () => {

        if (sort === "asc") {
            dispatch(sortTaskAction("des"))
        } else {
            dispatch(sortTaskAction("asc"))
        }

    }

    return (
        <div className='px-8 flex flex-col gap-5 mt-5 md:mt-8'>
            <Table className="hidden md:table border-t">
                <TableHeader>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="md:w-[40%]">Task Name</TableHead>
                    <TableHead className="w-[250px] cursor-pointer flex items-center" onClick={sortTask}>Due on{sort === "asc" ? <IoMdArrowDropdown /> : <IoMdArrowDropup />}</TableHead>
                    <TableHead className="w-[20%]">Task Status</TableHead>
                    <TableHead className=" w-[8%]">Task Category</TableHead>
                    <TableHead></TableHead>
                </TableHeader>
            </Table>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#FAC3FF] rounded-t-2xl px-4 font-bold'>Todo ({todoTasks.length})</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("todo")} onDragOver={(e) => handleOnDragOver(e)}>
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

            {selectedTasks.length > 0 &&
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
            {selectedTask && (
                <ViewTask task={selectedTask} />
            )}


        </div>
    )
}

export default TaskView