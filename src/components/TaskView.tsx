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
import { fetchTasksFromFirestore, updateTaskStatusInFirestore } from "@/features/task/taskSlice";
import Cookies from 'js-cookie';




const TaskView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { tasks, loading } = useSelector((state: RootState) => state.task);
    const userCookie = Cookies.get('user')
    const [inProgressTasks, setInProgressTasks] = useState(tasks.filter((task) => task.taskStatus === 'progress'))
    const [todoTasks, setTodoTasks] = useState(tasks.filter((task) => task.taskStatus === 'todo'))
    const [completedTasks, setCompletedTasks] = useState(tasks.filter((task) => task.taskStatus === 'completed'))
    useEffect(() => {
        if (userCookie) {
            const usr = JSON.parse(userCookie)
            const userId = usr.uid
            dispatch(fetchTasksFromFirestore(userId));
        }
    }, []);


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
    return (
        <div className='px-8 flex flex-col gap-5 mt-5'>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#FAC3FF] rounded-t-2xl px-4 font-bold'>Todo (3)</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("todo")} onDragOver={(e) => handleOnDragOver(e)}>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody >
                                {todoTasks.map((task) => (
                                    <TableRow className='h-16' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' /></TableCell>
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
                    <AccordionTrigger className='bg-[#85D9F1] rounded-t-2xl px-4 font-bold'>In-Progress (3)</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("progress")} onDragOver={(e) => handleOnDragOver(e)}>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody >
                                {inProgressTasks.map((task) => (
                                    <TableRow className='h-16' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' /></TableCell>
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
                    <AccordionTrigger className='bg-[#CEFFCC] rounded-t-2xl px-4 font-bold'>Completed (3)</AccordionTrigger>
                    <AccordionContent onDrop={() => handleOnDrop("completed")} onDragOver={(e) => handleOnDragOver(e)}>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody >
                                {completedTasks.map((task) => (
                                    <TableRow className='h-16' key={task.id} draggable onDragStart={(e) => handleOnDrag(e, task.id, task.taskStatus)} onDragEnd={(e) => handleDragEnd(e)}>
                                        <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' /></TableCell>
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

        </div>
    )
}

export default TaskView