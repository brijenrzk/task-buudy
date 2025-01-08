import React, { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Ellipsis } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import Cookies from 'js-cookie'
import { deleteTasksFromFirestore, fetchTasksFromFirestore, modalAction, taskViewAction, updateTaskStatusInFirestore } from '@/features/task/taskSlice'
import { formatCustomDate } from '@/lib/utils'
import ViewTask from './ViewTask'
import { useToast } from '@/hooks/use-toast'


interface TaskViewProps {
    searchQuery: string;
    selectedCategory: string;
    selectedDate: any;
}

const BoardView: React.FC<TaskViewProps> = ({ searchQuery, selectedCategory, selectedDate }) => {
    const { toast } = useToast()

    const dispatch = useDispatch<AppDispatch>();
    const { tasks, loading }: { tasks: any, loading: boolean } = useSelector((state: RootState) => state.task);
    const userCookie = Cookies.get('user')
    const isDesktop = useMediaQuery({ query: '(min-width: 1224px)' })
    const [inProgressTasks, setInProgressTasks] = useState(tasks.filter((task: any) => task.taskStatus === 'progress'))
    const [todoTasks, setTodoTasks] = useState(tasks.filter((task: any) => task.taskStatus === 'todo'))
    const [completedTasks, setCompletedTasks] = useState(tasks.filter((task: any) => task.taskStatus === 'completed'))
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const taskRef = useRef()
    const taskContainer = useRef()

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

    }, [loading])

    const handleDeleteTask = (task: any) => {
        dispatch(deleteTasksFromFirestore([task]));
        toast({
            title: "Task Deleted",
        })
    }

    const handleModalOpen = (task: any) => {
        setSelectedTask(task);
        dispatch(modalAction(true))
        setIsModalOpen(true)
    }
    const handleOnDrag = (e: any, id: any, taskStatus: any) => {
        console.log("id", id)
        e.target.style.opacity = 0.5
        taskRef.current = id
        taskContainer.current = taskStatus
        console.log(taskRef.current)
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
                    console.log(taskRef.current)
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


    if (!isDesktop) {
        dispatch(taskViewAction("list"))
    }



    return (
        <div className='flex px-8 pt-4 gap-8'>
            <div className='min-h-[75vh] w-[30%] bg-gray-100 rounded-xl pb-8' onDrop={() => handleOnDrop("todo")} onDragOver={(e) => handleOnDragOver(e)}>
                <div className='pt-4 mx-4 w-28 mb-4'>
                    <p className='bg-[#FAC3FF] h-10 flex justify-center items-center rounded-md px-2'>TO-DO</p>
                </div>
                <div className='px-4 flex flex-col gap-4'>
                    {todoTasks.length < 1 && <div className="h-[80vh] flex justify-center items-center"><p className="text-lg">No Tasks in To-Do</p></div>}
                    {todoTasks.map((task: any) => (
                        <div key={task.id} className='h-56 cursor-pointer w-full bg-white rounded-lg flex flex-col justify-between px-4 py-4 ' draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                            <div className='flex justify-between items-start'>
                                <h2 className='font-bold text-2xl  w-[80%]' onClick={() => handleModalOpen(task)}>{task.title} </h2>
                                <DropdownMenu>
                                    <DropdownMenuTrigger><Ellipsis /></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleModalOpen(task)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteTask(task)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className=' h-16' onClick={() => handleModalOpen(task)}></div>
                            <div className='flex justify-between' onClick={() => handleModalOpen(task)}>
                                <p className='text-gray-400'>{task.taskStatus}</p>
                                <p className='text-gray-400'>{formatCustomDate(task.dueDate)}</p>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            <div className='min-h-[75vh] w-[30%] bg-gray-100 rounded-xl' onDrop={() => handleOnDrop("progress")} onDragOver={(e) => handleOnDragOver(e)}>
                <div className='pt-4 mx-4 w-36 mb-4'>
                    <p className='bg-[#85D9F1] h-10 flex justify-center items-center rounded-md px-4'>IN-PROGRESS</p>
                </div>
                <div className='px-4 flex flex-col gap-4'>
                    {inProgressTasks.length < 1 && <div className="h-[80vh] flex justify-center items-center"><p className="text-lg">No Tasks in In Progress</p></div>}
                    {inProgressTasks.map((task: any) => (
                        <div key={task.id} className='h-56 cursor-pointer w-full bg-white rounded-lg flex flex-col justify-between px-4 py-4 ' draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)} >
                            <div className='flex justify-between items-start'>
                                <h2 className='font-bold text-2xl  w-[80%]' onClick={() => handleModalOpen(task)}>{task.title} </h2>
                                <DropdownMenu>
                                    <DropdownMenuTrigger><Ellipsis /></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleModalOpen(task)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteTask(task)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className=' h-16' onClick={() => handleModalOpen(task)}></div>
                            <div className='flex justify-between' onClick={() => handleModalOpen(task)}>
                                <p className='text-gray-400'>{task.taskStatus}</p>
                                <p className='text-gray-400'>{formatCustomDate(task.dueDate)}</p>
                            </div>
                        </div>
                    ))}

                </div>

            </div>


            <div className='min-h-[75vh] w-[30%] bg-gray-100 rounded-xl' onDrop={() => handleOnDrop("completed")} onDragOver={(e) => handleOnDragOver(e)}>
                <div className='pt-4 mx-4 w-28 mb-4'>
                    <p className='bg-[#A2D6A0] h-10 flex justify-center items-center rounded-md px-2'>DONE</p>

                </div>
                <div className='px-4 flex flex-col gap-4'>
                    {completedTasks.length < 1 && <div className="h-[80vh] flex justify-center items-center"><p className="text-lg">No Tasks in Done</p></div>}
                    {completedTasks.map((task: any) => (
                        <div key={task.id} className='h-56 cursor-pointer w-full bg-white rounded-lg flex flex-col justify-between px-4 py-4 ' draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                            <div className='flex justify-between items-start'>
                                <h2 className='font-bold text-2xl  w-[80%]' onClick={() => handleModalOpen(task)}>{task.title} </h2>
                                <DropdownMenu>
                                    <DropdownMenuTrigger><Ellipsis /></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleModalOpen(task)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteTask(task)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className=' h-16' onClick={() => handleModalOpen(task)}></div>
                            <div className='flex justify-between' onClick={() => handleModalOpen(task)}>
                                <p className='text-gray-400'>{task.taskStatus}</p>
                                <p className='text-gray-400'>{formatCustomDate(task.dueDate)}</p>
                            </div>
                        </div>
                    ))}

                </div>

            </div>
            {selectedTask && (
                <ViewTask task={selectedTask} />
            )}
        </div>
    )
}

export default BoardView