import { useState } from 'react'
import {
    DrawerClose,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    Drawer,
    DrawerContent,
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch } from 'react-redux';
import { addTaskToFirestore } from '@/features/task/taskSlice';
import { useAuth } from '@/hooks/useAuth';
import { AppDispatch } from '@/redux/store';
import { uploadFileToFirebase } from '@/services/firebaseConfig';
const AddTask = () => {
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [taskStatus, setTaskStatus] = useState('');
    const { user } = useAuth();
    const [modalOpen, setModalOpen] = useState(false)
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
        const task = {
            title,
            description,
            category,
            dueDate: new Date(taskDueDate).toISOString(),
            taskStatus,
            fileUrl,
            userId: user.uid,
        };

        // const taskId: any = await saveTaskToFirestore(task); // Save to Firestore

        // // Dispatch action to add task to Redux state
        // dispatch(addTask({ id: taskId, ...task }));
        try {
            // Dispatch the async action to add the task
            await dispatch(addTaskToFirestore(task));
            console.log('Task added successfully');
        } catch (error) {
            console.error('Failed to add task: ', error);
        }
        setModalOpen(false)

    };
    return (
        <>
            <Drawer open={modalOpen}>
                <DrawerTrigger>
                    <Button className='bg-[#7B1984] rounded-full px-6 py-5 hover:bg-[#7B1984]' onClick={() => setModalOpen(true)}>Add Task</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className='flex justify-between items-center border-b pb-6'>
                            <h2 className='text-xl'>Create Task</h2>
                            <DrawerClose>
                                <IoCloseSharp onClick={() => setModalOpen(false)} size={28} />
                            </DrawerClose>
                        </DrawerTitle>
                        <DrawerDescription className='flex flex-col gap-2 mt-4 justify-start'>
                            <Input required type="text" value={title} placeholder="Task title" className='shadow-none mb-2' onChange={(e) => setTitle(e.target.value)} />
                            <ReactQuill theme="snow" modules={modules} value={description} onChange={setDescription} className='mb-4' />
                            <Label className='mt-10 justify-self-start text-left font-normal'>Task Category<sup>*</sup></Label>
                            <ToggleGroup type="single" className='flex justify-start mb-2' onValueChange={setCategory}>
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
                            <Select onValueChange={setTaskStatus}>
                                <SelectTrigger className="w-[180px]  shadow-none">
                                    <SelectValue placeholder="Theme" />
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
                    </DrawerHeader>
                    <DrawerFooter className='flex flex-row justify-end  border-t pt-6'>
                        <DrawerClose className='w-28'>
                            <Button variant="outline" onClick={() => setModalOpen(false)} className='w-28 rounded-full'>Cancel</Button>
                        </DrawerClose>
                        <Button className='w-28 rounded-full bg-[#7B1984]' onClick={handleSubmit}>Create</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

        </>
    )
}

export default AddTask