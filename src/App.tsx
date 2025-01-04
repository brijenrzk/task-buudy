import './App.css'
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchUserData } from './features/auth/userSlice';
import { AppDispatch, RootState } from './redux/store';



const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((state: RootState) => state.user.status);




  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch])


  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
