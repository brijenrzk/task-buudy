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




const TaskView = () => {
    return (
        <div className='px-8 flex flex-col gap-5 mt-5'>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#FAC3FF] rounded-t-2xl px-4 font-bold'>Todo (3)</AccordionTrigger>
                    <AccordionContent>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody >
                                <TableRow className='h-16'>
                                    <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' /></TableCell>
                                    <TableCell><IoIosCheckmarkCircle size={20} className='text-gray-400' /></TableCell>
                                    <TableCell>Interview with design team</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#85D9F1] rounded-t-2xl px-4 font-bold'>In-Progress (3)</AccordionTrigger>
                    <AccordionContent>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody >
                                <TableRow className='h-16'>
                                    <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' /></TableCell>
                                    <TableCell><IoIosCheckmarkCircle size={20} className='text-gray-400' /></TableCell>
                                    <TableCell>Interview with design team</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible defaultValue='item-1'>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='bg-[#CEFFCC] rounded-t-2xl px-4 font-bold'>Completed (3)</AccordionTrigger>
                    <AccordionContent>
                        <Table className='bg-gray-100 rounded-b-2xl'>
                            <TableBody >
                                <TableRow className='h-16'>
                                    <TableCell className='pl-4'><Checkbox className='data-[state=checked]:bg-[#7B1984] data-[state=checked]:border-0' /></TableCell>
                                    <TableCell><IoIosCheckmarkCircle size={20} className='text-[#1B8D17]' /></TableCell>
                                    <TableCell>Interview with design team</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
    )
}

export default TaskView