import { useSelector } from "react-redux"
import SignIn from "../components/SignIn"
import { RootState } from "../redux/store"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Circle from "../components/Circle"
import { Task01Icon } from "hugeicons-react";
import { useMediaQuery } from "react-responsive"



const Login = () => {
    const user = useSelector((state: RootState) => state.user.user)
    const navigate = useNavigate()
    const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' })
    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [])

    if (isDesktop) {
        return (
            <div className="flex justify-center items-center h-screen w-full overflow-hidden relative bg-[#FFF9F9]">
                <div className="flex flex-col justify-start w-5/12 pl-[10%]">
                    <div className="flex gap-3 text-3xl items-center mb-3">
                        <Task01Icon color="#7B1984" size={42} />
                        <h1 className="text-5xl text-[#7B1984] font-bold">Task Buddy</h1>
                    </div>

                    <p className="text-base mb-10">Streamline your workflow and track progress effortlessly<br /> with our all-in-one task management app.</p>
                    <SignIn />

                </div>
                <div className="w-7/12 flex justify-end relative">
                    <img src="./dashboard.png" className="absolute right-[-25%] top-[10vh] w-[100%] h-[90%] object-contain" />
                    <div className="overflow-hidden mt-[15%]">
                        <div className='h-[105vh] w-[105vh] rounded-full border-solid border border-[#7b198479] flex justify-center items-center'>
                            <div className='h-[85vh] w-[85vh] rounded-full border-solid border border-[#7b198468] flex justify-center items-center'>
                                <div className='h-[65vh] w-[65vh] rounded-full border-solid border border-[#7B1984]'></div>
                            </div>
                        </div>
                    </div>
                </div>




            </div>
        )
    }
    return (
        <div className="flex justify-center items-center h-screen w-full flex-col overflow-hidden relative bg-[#FFF9F9]">
            <div className="flex flex-col justify-center items-center w-10/12">
                <div className="flex gap-3 text-3xl items-center mb-3">
                    <Task01Icon color="#7B1984" size={32} />
                    <h1 className="text-3xl text-[#7B1984] font-bold">Task Buddy</h1>
                </div>

                <p className="text-center text-sm mb-8">Streamline your workflow and track progress effortlessly with our all-in-one task management app.</p>
                <SignIn />

            </div>


            <div className="absolute top-[-70px] right-[-60px] overflow-hidden">
                <Circle />
            </div>
            <div className="absolute top-[25%] left-[-80px] overflow-hidden">
                <Circle />
            </div>
            <div className="absolute bottom-20 flex justify-center w-full overflow-hidden">
                <Circle />
            </div>

        </div>
    )
}

export default Login