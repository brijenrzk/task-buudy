import { useSelector } from "react-redux"
import SignIn from "../components/SignIn"
import { RootState } from "../redux/store"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Circle from "../components/Circle"
import { Task01Icon } from "hugeicons-react";


const Login = () => {
    const user = useSelector((state: RootState) => state.user.user)
    const navigate = useNavigate()
    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [])
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