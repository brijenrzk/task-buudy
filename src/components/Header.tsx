import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '@/components/ui/button';
import AddTask from '@/components/AddTask';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Input } from './ui/input';
import { Search01Icon } from 'hugeicons-react';

const Header = () => {
    return (
        <div className='px-8 mt-8 gap-4 flex flex-col w-full'>
            <div className='flex flex-1 justify-end'>
                <Drawer>
                    <DrawerTrigger>
                        <Button className='bg-[#7B1984] rounded-full px-6 py-5 hover:bg-[#7B1984]'>Add Task</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <AddTask />
                    </DrawerContent>
                </Drawer>
            </div>

            <div className='flex flex-col gap-4'>
                <Label htmlFor="ema" className='text-gray-500'>Filter by:</Label>
                <div className='flex gap-4'>
                    <Select>
                        <SelectTrigger className="w-[140px] rounded-full">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todo">Work</SelectItem>
                            <SelectItem value="progress">Personal</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-[130px] rounded-full">
                            <SelectValue placeholder="Due Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todo">Work</SelectItem>
                            <SelectItem value="progress">Personal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

            </div>
            <div>
                <div className='relative flex items-center bg-[#FBFBFB] p-2 rounded-full'>
                    <Search01Icon className='absolute' size={19} color='grey' />
                    <Input type='search' placeholder='Search' className='border-0 shadow-none focus-visible:ring-0 active:border-none pl-10' />
                </div>
            </div>
        </div>
    )
}

export default Header