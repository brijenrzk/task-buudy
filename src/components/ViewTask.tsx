import { useCallback, useEffect, useState } from 'react'
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
import { cn, formatDate } from '@/lib/utils';
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
import { deleteImageInFirestore, modalAction, updateImagesToCloudinary, updateTaskToFirestore } from '@/features/task/taskSlice';
import { useAuth } from '@/hooks/useAuth';
import { AppDispatch, RootState } from '@/redux/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
interface Task {
    title: string;
    description: string;
    category: string;
    dueDate: string;
    taskStatus: string;
    fileUrl: Array<string>;
    userId: string;
    taskHistory: Array<Object>;
}



const ViewTask = ({ task }: { task: any }) => {
    const { toast } = useToast()
    const { tasks } = useSelector((state: RootState) => state.task);
    const tas = tasks.find((t: any) => t.id === task.id) || task
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date(tas.dueDate))
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState(tas.title);
    const [description, setDescription] = useState(tas.description);
    const [category, setCategory] = useState(tas.category);
    const [files, setFiles] = useState<any[]>([]);
    const [taskStatus, setTaskStatus] = useState(tas.taskStatus);
    const { viewTaskModal } = useSelector((state: RootState) => state.task)
    const isDesktop = useMediaQuery({ query: '(min-width: 1224px)' })
    const updateStatus = useSelector((state: RootState) => state.task.updateStatus);
    const { updateImages } = useSelector((state: RootState) => state.task);
    const [titleError, setTitleError] = useState<boolean>(false)
    const [categoryError, setCategoryError] = useState<boolean>(false)
    const [statusError, setStatusError] = useState<boolean>(false)
    const { loading } = useSelector((state: RootState) => state.task);

    const { user } = useAuth();


    useEffect(() => {
        console.log("bulaya", task)
        setTitle(tas.title)
        setDueDate(new Date(tas.dueDate))
        setDescription(tas.description)
        setTaskStatus(tas.taskStatus)
    }, [task])


    useEffect(() => {
        return () => {
            files.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
        };
    }, [files]);
    useEffect(() => {
        if (updateStatus === "succeeded") {
            console.log('Upload completed successfully');
            // You can trigger task creation here if needed
            updateTask()

        }
    }, [updateStatus]);
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
    const removeFilefromCloudinary = (url: string) => {
        dispatch(deleteImageInFirestore({ id: task.id, url }))

    }


    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        ],
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(title, description, category, taskStatus, dueDate)

        if (files.length > 0) {
            dispatch(updateImagesToCloudinary(files));
            console.log("ssss")
        } else {
            updateTask()
            console.log("sssddds")
        }
    };


    const updateTask = async () => {
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
        const taskHistory = [...task.taskHistory, { activity: "You Updated this task", timestamp: currentDate }]
        const newUrl = [...tas.fileUrl, ...updateImages]

        const updatedTask: Task = {
            title,
            description,
            category,
            dueDate: new Date(taskDueDate).toISOString(),
            taskStatus,
            fileUrl: newUrl,
            userId: user.uid,
            taskHistory: taskHistory
        };

        try {
            // Dispatch the async action to add the task
            await dispatch(updateTaskToFirestore({ id: task.id, taskData: updatedTask }));
            console.log('Task updated successfully');
        } catch (error) {
            console.error('Failed to add task: ', error);
        }
        dispatch(modalAction(false))
        toast({
            title: "Task Updated Sucessfully.",
        })
    };



    const checkModel = () => {
        dispatch(modalAction(false))
        setFiles([])
    }





    //Desktop
    if (isDesktop) {
        return (
            <Dialog open={viewTaskModal} onOpenChange={checkModel}>
                <DialogContent className="min-w-[75%]">
                    <DialogHeader className=''>
                        <DialogTitle className='flex justify-between items-center border-b pb-6'>
                        </DialogTitle>
                        <div className='flex h-[60vh]'>
                            <div className='w-[66%] px-7 h-[55vh] overflow-x-scroll'>
                                <DialogDescription className='flex flex-col gap-5'>
                                    <Input required type="text" value={title} placeholder="Task title" className={`shadow-none mt-2 h-12 ${titleError && "border-red-500"}`} onChange={(e) => setTitle(e.target.value)} />
                                    <ReactQuill theme="snow" modules={modules} value={description} onChange={setDescription} className='mb-4 h-36' />
                                    <div className='flex justify-between mt-10 items-center'>
                                        <div className='flex flex-col gap-4'>
                                            <Label className='justify-self-start text-left font-normal'>Task Category<sup>*</sup></Label>
                                            <ToggleGroup type="single" className='flex justify-start gap-4' onValueChange={setCategory} value={category}>
                                                <ToggleGroupItem value="work" aria-label="Toggle work" className={`border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white ${categoryError && "border-red-500"}`}>
                                                    Work
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="personal" aria-label="Toggle personal" className={`border rounded-full w-24 data-[state=on]:bg-[#7B1984] data-[state=on]:text-white ${categoryError && "border-red-500"}`}>
                                                    Personal
                                                </ToggleGroupItem>

                                            </ToggleGroup>
                                        </div>
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
                                            <Label className='text-left mt-2 font-normal'>Task Status<sup>*</sup></Label>
                                            <Select onValueChange={setTaskStatus} value={taskStatus}>
                                                <SelectTrigger className={`w-[180px]  shadow-none ${statusError && "border-red-500"}`}>
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
                                    <div className='flex gap-4 flex-wrap'>
                                        {tas && tas.fileUrl.length > 0 &&
                                            tas.fileUrl.map((url: string, index: number) => (
                                                <div className='relative' key={index}>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <X className='absolute right-[-8px] top-[-8px] bg-gray-100 rounded-full shadow-sm h-6 w-6 p-0.5 cursor-pointer' />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Are you sure to Delete?</DialogTitle>
                                                                <DialogDescription>
                                                                    This action cannot be undone. This will permanently delete this image
                                                                    from our servers.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>

                                                                <DialogClose asChild>
                                                                    <Button onClick={() => removeFilefromCloudinary(url)}>Delete</Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <img key={index}
                                                        src={url}
                                                        className='h-40 w-40 rounded-sm' />

                                                </div>

                                            ))}
                                    </div>
                                </DialogDescription>
                            </div>
                            <div className='w-[34%] bg-gray-100'>
                                <div className='bg-white h-14 shadow-sm flex items-center px-7'>
                                    <h3 className='text-xl'>Activity</h3>
                                </div>
                                <div className='flex flex-col gap-4 pt-4 px-8 h-[50vh] overflow-x-scroll'>
                                    {task.taskHistory.map((history: any) => (
                                        <div className='flex justify-between border-b border-gray-300 pb-2'>
                                            <p className='text-left text-sm w-[75%]'>{history.activity}</p>
                                            <p className='text-right text-sm w-[35%]'>{formatDate(history.timestamp)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>


                    <DialogFooter className='flex flex-row justify-end  border-t'>
                        <DialogClose asChild className='w-28'>
                            <Button variant="outline" onClick={checkModel} className='w-28 rounded-full'>Cancel</Button>
                        </DialogClose>
                        <Button className='w-28 rounded-full bg-[#7B1984] hover:bg-[#7b1984bb]' onClick={handleSubmit}>
                            {loading ? <div className="w-4 h-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                :
                                <>Update</>
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }







    //Mobile
    return (
        <>
            <Drawer open={viewTaskModal} onOpenChange={checkModel}>
                <DrawerContent className='h-[85vh]'>
                    <DrawerHeader>
                        <DrawerTitle className='flex justify-end items-center border-b pb-6'>
                            <DrawerClose>
                                <IoCloseSharp onClick={checkModel} size={28} />
                            </DrawerClose>
                        </DrawerTitle>
                        <Tabs defaultValue="details">
                            <TabsList>
                                <TabsTrigger value="details" className='data-[state="active"]:bg-black data-[state="active"]:text-white'>Details</TabsTrigger>
                                <TabsTrigger value="activity" className='data-[state="active"]:bg-black data-[state="active"]:text-white'>Activity</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className='h-[55vh] overflow-y-scroll'>
                                <DrawerDescription className='flex flex-col gap-2 mt-4 justify-start'>
                                    <Input required type="text" value={title} placeholder="Task title" className={`shadow-none mb-2 ${titleError && "border-red-500"}`} onChange={(e) => setTitle(e.target.value)} />
                                    <ReactQuill theme="snow" modules={modules} value={description} onChange={setDescription} className='mb-4' />
                                    <Label className='mt-10 justify-self-start text-left font-normal'>Task Category<sup>*</sup></Label>
                                    <ToggleGroup type="single" className='flex justify-start mb-2' onValueChange={setCategory} value={category}>
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
                                    <Select onValueChange={setTaskStatus} value={taskStatus}>
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
                                    <div className='flex gap-4 flex-wrap'>
                                        {tas && tas.fileUrl.length > 0 &&
                                            tas.fileUrl.map((url: string, index: number) => (
                                                <div className='relative' key={index}>
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <X className='absolute right-[-8px] top-[-8px] bg-gray-100 rounded-full shadow-sm h-6 w-6 p-0.5 cursor-pointer' />
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Are you sure to Delete?</DialogTitle>
                                                                <DialogDescription>
                                                                    This action cannot be undone. This will permanently delete this image
                                                                    from our servers.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>

                                                                <DialogClose asChild>
                                                                    <Button onClick={() => removeFilefromCloudinary(url)}>Delete</Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <img key={index}
                                                        src={url}
                                                        className='h-40 w-40 rounded-sm' />

                                                </div>

                                            ))}
                                    </div>

                                </DrawerDescription>

                                <DrawerFooter className='flex flex-row justify-end w-full border-t pt-6 absolute bottom-2 right-2'>
                                    <DrawerClose className='w-28'>
                                        <Button variant="outline" onClick={checkModel} className='w-28 rounded-full'>Cancel</Button>
                                    </DrawerClose>
                                    <Button className='w-28 rounded-full bg-[#7B1984]' onClick={handleSubmit}>
                                        {loading ? <div className="w-4 h-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            :
                                            <>Update</>
                                        }
                                    </Button>
                                </DrawerFooter>
                            </TabsContent>


                            <TabsContent value="activity">
                                <div className='flex flex-col gap-4 pt-4'>
                                    {task.taskHistory.map((history: any) => (
                                        <div className='flex justify-between border-b pb-2'>
                                            <p className='text-left text-sm w-[75%]'>{history.activity}</p>
                                            <p className='text-right text-sm w-[35%]'>{formatDate(history.timestamp)}</p>
                                        </div>
                                    ))}
                                </div>

                            </TabsContent>
                        </Tabs>


                    </DrawerHeader>

                </DrawerContent>
            </Drawer>

        </>
    )
}

export default ViewTask