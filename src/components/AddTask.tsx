import { useState } from 'react'
import {
    DrawerClose,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
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
const AddTask = () => {
    const [date, setDate] = useState<Date>()
    const [value, setValue] = useState('');
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        ],
    }
    return (
        <>
            <DrawerHeader>
                <DrawerTitle className='flex justify-between items-center border-b pb-6'>
                    <h2 className='text-xl'>Create Task</h2>
                    <DrawerClose>
                        <IoCloseSharp size={28} />
                    </DrawerClose>
                </DrawerTitle>
                <DrawerDescription className='flex flex-col gap-2 mt-4 justify-start'>
                    <Input type="text" placeholder="Task title" className='shadow-none mb-2' />
                    <ReactQuill theme="snow" modules={modules} value={value} onChange={setValue} className='mb-4' />
                    <Label className='mt-10 justify-self-start text-left font-normal'>Task Category<sup>*</sup></Label>
                    <ToggleGroup type="single" className='flex justify-start mb-2'>
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
                                    !date && "text-muted-foreground"
                                )}
                            >
                                {/* <CalendarIcon /> */}
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Label className='text-left mt-2 font-normal'>Task Status<sup>*</sup></Label>
                    <Select>
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
                    <Input id="picture" type="file" />
                </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className='flex flex-row justify-end  border-t pt-6'>
                <DrawerClose className='w-28'>
                    <Button variant="outline" className='w-28 rounded-full'>Cancel</Button>
                </DrawerClose>
                <Button className='w-28 rounded-full bg-[#7B1984]'>Create</Button>
            </DrawerFooter>
        </>
    )
}

export default AddTask