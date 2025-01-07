import { useState } from 'react'
import {
    DrawerClose,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    Drawer,
    DrawerContent,
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { modalAction, updateTaskToFirestore } from '@/features/task/taskSlice';
import { useAuth } from '@/hooks/useAuth';
import { AppDispatch, RootState } from '@/redux/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface Task {
    title: string;
    description: string;
    category: string;
    dueDate: string;
    taskStatus: string;
    fileUrl: string;
    userId: string;
    taskHistory: Array<Object>;
}



const ViewTask = ({ task }: { task: any }) => {
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date(task.dueDate))
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [category, setCategory] = useState(task.category);
    const [file, setFile] = useState<File | null>(null);
    const [taskStatus, setTaskStatus] = useState(task.taskStatus);
    const { viewTaskModal } = useSelector((state: RootState) => state.task)

    const { user } = useAuth();


    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        ],
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(title, description, category, taskStatus, dueDate)

        let fileUrl = '';
        if (file) {
            // Upload the file to Firebase and get the URL
            // fileUrl = await uploadFileToFirebase(file);
        }
        if (!user) {
            console.error('User not authenticated.');
            return;
        }
        const taskDueDate = dueDate ?? new Date();
        const currentDate = new Date().toISOString()
        const taskHistory = [...task.taskHistory, { activity: "You Updated this task", timestamp: currentDate }]
        const updatedTask: Task = {
            title,
            description,
            category,
            dueDate: new Date(taskDueDate).toISOString(),
            taskStatus,
            fileUrl,
            userId: user.uid,
            taskHistory: taskHistory
        };

        // const taskId: any = await saveTaskToFirestore(task); // Save to Firestore

        // // Dispatch action to add task to Redux state
        // dispatch(addTask({ id: taskId, ...task }));
        try {
            // Dispatch the async action to add the task
            await dispatch(updateTaskToFirestore({ id: task.id, taskData: updatedTask }));
            console.log('Task updated successfully');
        } catch (error) {
            console.error('Failed to add task: ', error);
        }
        dispatch(modalAction(false))
    };

    const checkModel = () => {
        dispatch(modalAction(false))
    }
    return (
        <>
            <Drawer open={viewTaskModal}>
                <DrawerContent className='h-[85vh]'>
                    <DrawerHeader>
                        <DrawerTitle className='flex justify-between items-center border-b pb-6'>
                            <h2 className='text-xl'>C</h2>
                            <DrawerClose>
                                <IoCloseSharp onClick={checkModel} size={28} />
                            </DrawerClose>
                        </DrawerTitle>
                        <Tabs defaultValue="details">
                            <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="activity">Activity</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details">
                                <DrawerDescription className='flex flex-col gap-2 mt-4 justify-start'>
                                    <Input required type="text" value={title} placeholder="Task title" className='shadow-none mb-2' onChange={(e) => setTitle(e.target.value)} />
                                    <ReactQuill theme="snow" modules={modules} value={description} onChange={setDescription} className='mb-4' />
                                    <Label className='mt-10 justify-self-start text-left font-normal'>Task Category<sup>*</sup></Label>
                                    <ToggleGroup type="single" className='flex justify-start mb-2' onValueChange={setCategory} value={category}>
                                        <ToggleGroupItem value="work" aria-label="Toggle work" className='border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white'>
                                            Work
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="personal" aria-label="Toggle personal" className='border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white'>
                                            Personal
                                        </ToggleGroupItem>

                                    </ToggleGroup>
                                    <Label className='text-left font-normal'>Due on<sup>*</sup></Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal shadow-none",
                                                    !dueDate && "text-muted-foreground"
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

                                    <Label className='text-left mt-2 font-normal'>Task Status<sup>*</sup></Label>
                                    <Select onValueChange={setTaskStatus} value={taskStatus}>
                                        <SelectTrigger className="w-[180px]  shadow-none">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">TODO</SelectItem>
                                            <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                            <SelectItem value="done">DONE</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Label className='text-left mt-2 font-normal'>Attachment</Label>
                                    <Input id="picture" type="file" onChange={handleFileChange} />

                                </DrawerDescription>

                                <DrawerFooter className='flex flex-row justify-end  border-t pt-6'>
                                    <DrawerClose className='w-28'>
                                        <Button variant="outline" onClick={checkModel} className='w-28 rounded-full'>Cancel</Button>
                                    </DrawerClose>
                                    <Button className='w-28 rounded-full bg-[#7B1984]' onClick={handleSubmit}>Update</Button>
                                </DrawerFooter>
                            </TabsContent>


                            <TabsContent value="activity">
                                {task.taskHistory.map((history: any) => (
                                    <div>{history.activity}</div>
                                ))}
                            </TabsContent>
                        </Tabs>


                    </DrawerHeader>

                </DrawerContent>
            </Drawer>

        </>
    )
}

export default ViewTask