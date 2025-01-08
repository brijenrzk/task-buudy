import { useCallback, useEffect, useState } from 'react'
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
import { useDispatch, useSelector } from 'react-redux';
import { addTaskToFirestore, uploadImagesToCloudinary } from '@/features/task/taskSlice';
import { useAuth } from '@/hooks/useAuth';
import { AppDispatch, RootState } from '@/redux/store';
import { useMediaQuery } from 'react-responsive';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useDropzone } from 'react-dropzone'
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const AddTask = () => {
    const { toast } = useToast()
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [files, setFiles] = useState<any[]>([]);
    const [taskStatus, setTaskStatus] = useState('');
    const { user } = useAuth();
    const [modalOpen, setModalOpen] = useState(false)
    const { uploadedImages } = useSelector((state: RootState) => state.task);
    const uploadStatus = useSelector((state: RootState) => state.task.uploadStatus);
    const { loading } = useSelector((state: RootState) => state.task);
    const [titleError, setTitleError] = useState<boolean>(false)
    const [categoryError, setCategoryError] = useState<boolean>(false)
    const [statusError, setStatusError] = useState<boolean>(false)
    const isDesktop = useMediaQuery({ query: '(min-width: 1224px)' })
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        ],
    }
    useEffect(() => {
        return () => {
            files.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
        };
    }, [files]);
    useEffect(() => {
        if (uploadStatus === "succeeded") {
            console.log('Upload completed successfully');
            // You can trigger task creation here if needed
            console.log("merelo bulaya")
            createTask()

        }
    }, [uploadStatus]);
    const onDrop = useCallback((acceptedFiles: any) => {
        setFiles((prev) => [...prev, ...acceptedFiles])

    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/png': ['.png', '.jpg', '.jpeg', '.webp']
        }, onDrop
    })

    const removeFile = (file: any) => {
        let newFiles = files.filter((f) => f != file)
        setFiles(newFiles)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(title, description, category, taskStatus, dueDate)
        if (files.length > 0) {
            dispatch(uploadImagesToCloudinary(files));
        } else {
            createTask()
        }
    };
    const createTask = async () => {
        console.log(title, description, category, taskStatus, dueDate)
        if (title.trim() == '') {
            setTitleError(true)
            return;
        } else { setTitleError(false) }
        if (category.trim() == '') {
            setCategoryError(true)
            return;
        } else { setCategoryError(false) }
        if (taskStatus.trim() == '') {
            setStatusError(true)
            return;
        } else { setStatusError(false) }
        if (!user) {
            console.error('User not authenticated.');
            return;
        }
        const taskDueDate = dueDate ?? new Date();
        const currentDate = new Date().toISOString()
        const task = {
            title,
            description,
            category,
            dueDate: new Date(taskDueDate).toISOString(),
            taskStatus,
            fileUrl: uploadedImages,
            userId: user.uid,
            taskHistory: [{ activity: "You Created this task", timestamp: currentDate }]
        };

        try {
            await dispatch(addTaskToFirestore(task))
            console.log('Task added successfully');
        } catch (error) {
            console.error('Failed to add task: ', error);
        }
        setModalOpen(false)
        toast({
            title: "Task Created Sucessfully.",
        })



    };
    const checkModel = () => {
        setModalOpen(!modalOpen)
        setTitle('')
        setDescription('')
        setTaskStatus('')
        setCategory('')
        setDueDate(new Date())
        setFiles([])
    }

    //Desktop

    if (isDesktop) {
        return (
            <Dialog open={modalOpen} onOpenChange={checkModel}>
                <DialogTrigger asChild>
                    <Button className='bg-[#7B1984] rounded-full px-6 py-5 hover:bg-[#7B1984]' onClick={() => setModalOpen(true)}>Add Task</Button>
                </DialogTrigger>
                <DialogContent className="min-w-[60%] h-[90vh] overflow-x-scroll">
                    <DialogHeader className='pb-10'>
                        <DialogTitle className='flex justify-between items-center border-b pb-6'>
                            <h2 className='text-xl'>Create Task</h2>
                        </DialogTitle>
                        <DialogDescription className='flex flex-col gap-5'>
                            <Input type="text" value={title} placeholder="Task title" className={`shadow-none mt-2 h-12 ${titleError && "border-red-500"}`} onChange={(e) => setTitle(e.target.value)} />
                            <ReactQuill theme="snow" modules={modules} value={description} onChange={setDescription} className='mb-4 h-36' />
                            <div className='flex justify-between mt-10 items-center '>
                                <div className='flex flex-col gap-4'>
                                    <Label className='justify-self-start text-left font-normal'>Task Category<sup>*</sup></Label>
                                    <ToggleGroup type="single" className={`flex justify-start gap-4 ${categoryError && "border-red-500"}`} onValueChange={setCategory}>
                                        <ToggleGroupItem value="work" aria-label="Toggle work" className={`border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white ${categoryError && "border-red-500"}`}>
                                            Work
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="personal" aria-label="Toggle personal" className={`border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white ${categoryError && "border-red-500"}`}>
                                            Personal
                                        </ToggleGroupItem>

                                    </ToggleGroup>
                                </div>
                                <div className='flex gap-8 items-center'>


                                    <div className='flex flex-col gap-4'>
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
                                    </div>
                                    <div className='flex flex-col gap-4'>
                                        <Label className='text-left font-normal'>Task Status<sup>*</sup></Label>
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
                                    </div>
                                </div>

                            </div>


                            <Label className='text-left mt-2 font-normal'>Attachment</Label>

                            <div {...getRootProps()} className='h-24 w-full bg-gray-100 border border-gray-200 flex justify-center items-center'>
                                <input {...getInputProps()} />
                                {
                                    isDragActive ?
                                        <p>Drop the files here </p> :
                                        <p>Drop your files here or <span className='text-blue-500 underline cursor-pointer'>Upload</span></p>
                                }
                            </div>
                            <div className='flex gap-4 flex-wrap'>
                                {files.length > 0 &&
                                    files.map((file, index) => (
                                        <div className='relative' key={index}>
                                            <X className='absolute right-[-8px] top-[-8px] bg-gray-100 rounded-full shadow-sm h-6 w-6 p-0.5 cursor-pointer' onClick={() => removeFile(file)} />
                                            <img key={index}
                                                src={URL.createObjectURL(file)}
                                                className='h-40 w-40 rounded-sm' />

                                        </div>

                                    ))}
                            </div>

                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className='flex flex-row justify-end  border-t pt-6'>
                        <DialogClose asChild className='w-28'>
                            <Button variant="outline" onClick={() => setModalOpen(false)} className='w-28 rounded-full'>Cancel</Button>
                        </DialogClose>
                        <Button className='w-28 rounded-full bg-[#7B1984] hover:bg-[#7b1984bb]' onClick={handleSubmit}>
                            {loading ? <div className="w-4 h-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                :
                                <>Create</>
                            }

                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        )
    }





    //Mobile
    return (
        <>
            <Drawer open={modalOpen} onOpenChange={checkModel}>
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
                            <Input required type="text" value={title} placeholder="Task title" className={`shadow-none mb-2 ${titleError && "border-red-500"}`} onChange={(e) => setTitle(e.target.value)} />
                            <ReactQuill theme="snow" modules={modules} value={description} onChange={setDescription} className='mb-4' />
                            <Label className='mt-10 justify-self-start text-left font-normal'>Task Category<sup>*</sup></Label>
                            <ToggleGroup type="single" className='flex justify-start mb-2' onValueChange={setCategory}>
                                <ToggleGroupItem value="work" aria-label="Toggle work" className={`border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white ${categoryError && "border-red-500"}`}>
                                    Work
                                </ToggleGroupItem>
                                <ToggleGroupItem value="personal" aria-label="Toggle personal" className={`border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white ${categoryError && "border-red-500"}`}>
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
                                <SelectTrigger className={`w-[180px]  shadow-none ${statusError && "border-red-500"}`}>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">TODO</SelectItem>
                                    <SelectItem value="progress">IN-PROGRESS</SelectItem>
                                    <SelectItem value="completed">DONE</SelectItem>
                                </SelectContent>
                            </Select>

                            <Label className='text-left mt-2 font-normal'>Attachment</Label>
                            <div {...getRootProps()} className='h-24 w-full bg-gray-100 border border-gray-200 flex justify-center items-center'>
                                <input {...getInputProps()} />
                                {
                                    isDragActive ?
                                        <p>Drop the files here </p> :
                                        <p>Drop your files here or <span className='text-blue-500 underline cursor-pointer'>Upload</span></p>
                                }
                            </div>
                            <div className='flex gap-4 flex-wrap'>
                                {files.length > 0 &&
                                    files.map((file, index) => (
                                        <div className='relative' key={index}>
                                            <X className='absolute right-[-8px] top-[-8px] bg-gray-100 rounded-full shadow-sm h-6 w-6 p-0.5 cursor-pointer' onClick={() => removeFile(file)} />
                                            <img key={index}
                                                src={URL.createObjectURL(file)}
                                                className='h-40 w-40 rounded-sm' />

                                        </div>

                                    ))}
                            </div>
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter className='flex flex-row justify-end  border-t pt-6'>
                        <DrawerClose className='w-28'>
                            <Button variant="outline" onClick={() => setModalOpen(false)} className='w-28 rounded-full'>Cancel</Button>
                        </DrawerClose>
                        <Button className='w-28 rounded-full bg-[#7B1984]' onClick={handleSubmit}>
                            {loading ? <div className="w-4 h-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                :
                                <>Create</>
                            }
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

        </>
    )
}

export default AddTask