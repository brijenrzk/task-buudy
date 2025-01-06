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
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useRef, useState } from "react";
import { deleteTasksFromFirestore, fetchTasksFromFirestore, updateTaskStatusInFirestore } from "@/features/task/taskSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Cookies from 'js-cookie';
import { Button } from "./ui/button";
interface TaskViewProps {
    searchQuery: string;
    selectedCategory: string;
}




const TaskView: React.FC<TaskViewProps> = ({ searchQuery, selectedCategory }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { tasks, loading } = useSelector((state: RootState) => state.task);
    const userCookie = Cookies.get('user')
    const [inProgressTasks, setInProgressTasks] = useState(tasks.filter((task) => task.taskStatus === 'progress'))
    const [todoTasks, setTodoTasks] = useState(tasks.filter((task) => task.taskStatus === 'todo'))
    const [completedTasks, setCompletedTasks] = useState(tasks.filter((task) => task.taskStatus === 'completed'))
    const [selectedTasks, setSelectedTasks] = useState<(string)[]>([])
    // Filter tasks based on the search query
    const filteredTasks = tasks.filter((task) => {
        const matchesSearchQuery = task.title.toLowerCase().includes(searchQuery)
        const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
        return matchesCategory && matchesSearchQuery


    }
    );

    useEffect(() => {
        if (userCookie) {
            const usr = JSON.parse(userCookie)
            const userId = usr.uid
            dispatch(fetchTasksFromFirestore(userId));
        }
    }, []);


    useEffect(() => {
        setTodoTasks(filteredTasks.filter((task) => task.taskStatus === 'todo'))
        setInProgressTasks(filteredTasks.filter((task) => task.taskStatus === 'progress'))
        setCompletedTasks(filteredTasks.filter((task) => task.taskStatus === 'completed'))
    }, [searchQuery, selectedCategory])


    useEffect(() => {
        if (!loading) {
            setTodoTasks(tasks.filter((task) => task.taskStatus === 'todo'))
            setInProgressTasks(tasks.filter((task) => task.taskStatus === 'progress'))
            setCompletedTasks(tasks.filter((task) => task.taskStatus === 'completed'))
        }

    }, [loading])

    const taskRef = useRef()
    const taskContainer = useRef()

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
        switch (container) {
            case 'todo':

                setTodoTasks((prev) => [...prev, currentTask])
                break;
            case 'progress':
                setInProgressTasks((prev) => [...prev, currentTask])
                break;
            case 'completed':
                setCompletedTasks((prev) => [...prev, currentTask])
        }
        if (sourceContainer) {
            switch (sourceContainer) {
                case 'todo':
                    setTodoTasks(todoTasks.filter((task) => task.id != taskRef.current))
                    break;
                case 'progress':
                    setInProgressTasks(inProgressTasks.filter((task) => task.id != taskRef.current))
                    break;
                case 'completed':
                    console.log(taskRef.current)
                    setCompletedTasks(completedTasks.filter((task) => task.id != taskRef.current))
                    break;
            }
        }

        let currentTask: any = tasks.find((task) => task.id == taskRef.current)
        if (taskRef.current) {
            dispatch(updateTaskStatusInFirestore({ id: taskRef.current, taskStatus: container }))
        }
    }
    const handleOnDragOver = (e: any) => {
        e.preventDefault();
    }

    const handleSelectTask = (e: any, taskId: string | undefined) => {
        if (e === true && taskId) {
            setSelectedTasks((prev) => [...prev, taskId])
        } else {
            let newSelectedTask = selectedTasks.filter((task) => task != taskId)
            setSelectedTasks(newSelectedTask)
        }
    }

    const handleBulkDelete = () => {
        if (selectedTasks) {
            dispatch(deleteTasksFromFirestore(selectedTasks));
            setSelectedTasks([])
        }

    }

    return (
        <div className='px-8 flex flex-col gap-5 mt-5'>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#FAC3FF] rounded-t-2xl px-4 font-bold'>Todo ({todoTasks.length})</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("todo")} onDragOver={(e) => handleOnDragOver(e)}>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody >
                                {todoTasks.map((task) => (
                                    <TableRow className='h-16' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' onCheckedChange={(e) => handleSelectTask(e, task.id)} /></TableCell>
                                        <TableCell><IoIosCheckmarkCircle size={20} className='text-gray-400' /></TableCell>
                                        <TableCell>{task.title}</TableCell>
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
                            <TableBody >
                                {inProgressTasks.map((task) => (
                                    <TableRow className='h-16 cursor-move' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' onCheckedChange={(e) => handleSelectTask(e, task.id)} /></TableCell>
                                        <TableCell><IoIosCheckmarkCircle size={20} className='text-gray-400' /></TableCell>
                                        <TableCell>{task.title}</TableCell>
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
                            <TableBody >
                                {completedTasks.map((task) => (
                                    <TableRow className='h-16' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' onCheckedChange={(e) => handleSelectTask(e, task.id)} /></TableCell>
                                        <TableCell><IoIosCheckmarkCircle size={20} className='text-[#1B8D17]' /></TableCell>
                                        <TableCell>{task.title}</TableCell>
                                    </TableRow>
                                )

                                )}

                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {selectedTasks.length > 0 &&
                <div className="absolute flex bottom-8 h-20 w-[80%] bg-[#1A1C20] left-[50%] translate-x-[-50%] rounded-xl shadow-md px-4 items-center justify-between">
                    <div className="border border-white w-[35%] h-10 rounded-full flex items-center justify-center">
                        <p className="text-white font-bold">{selectedTasks.length} Tasks Selected</p>
                    </div>
                    <div className="flex gap-2">
                        <Select>
                            <SelectTrigger className="w-[130px]  shadow-none text-white rounded-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent side="top">
                                <SelectItem value="todo">TODO</SelectItem>
                                <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                <SelectItem value="done">DONE</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="w-[130px] border border-[#E13838] rounded-full text-[#E13838] bg-[#e1383834]" onClick={handleBulkDelete}>
                            Delete
                        </Button>
                    </div>

                </div>
            }



        </div>
    )
}

export default TaskView