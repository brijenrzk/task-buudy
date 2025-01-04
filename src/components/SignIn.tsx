import { useDispatch } from 'react-redux'
import { loginFailure, loginStart, loginSuccess } from '../features/auth/authSlice';
import { signInWithGoogle } from '../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchUserData } from '../features/auth/userSlice';
import { AppDispatch } from '../redux/store';
import { Button } from "@/components/ui/button"


const SignIn = () => {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();



    const handleGoogleSignIn = async () => {
        dispatch(loginStart());
        try {
            const user = await signInWithGoogle()
            Cookies.set('user', JSON.stringify(user), { expires: 7 });
            dispatch(loginSuccess(user))
            dispatch(fetchUserData())
            navigate('/dashboard');
        } catch (err: any) {
            dispatch(loginFailure(err))
        }
    }
    return (
        <div className=''>
            <Button className='rounded-xl p-6' onClick={handleGoogleSignIn}><img src='/google.png' className='h-5 w-5' />Continue with Google</Button>
        </div>
    )
}

export default SignIn