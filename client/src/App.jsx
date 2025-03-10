import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Landing from './Pages/Landing/Landing'
import Login from './Pages/Login/Login'
import Signup from './Pages/Signup/Signup'
import ForgotPassword from './Pages/Forgot Password/ForgotPassword'
import Home from './Pages/Home/Home'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useGetUserDetails } from './Hooks/authenticationHooks'
import { ProtectAuth } from './Middlewares/ProtectRoutes'

function App() {

    const { userDetails } = useSelector( state => state.authentication )
    const getUserDetails = useGetUserDetails()

    useEffect( () => {
        
        getUserDetails()
        
    }, [ userDetails ] )
    
    return (

        <>

            <Routes>

                <Route element={ <Landing /> } path='/' />
                <Route element={ <Home /> } path='/home' />
                <Route element={ <ProtectAuth><Login /></ProtectAuth> } path='/login' />
                <Route element={ <ProtectAuth><Signup /></ProtectAuth> } path='/signup' />
                <Route element={ <ProtectAuth><ForgotPassword /></ProtectAuth> } path='/forgotpassword' />

            </Routes>

            <Toaster />
            
        </>
        
    )
}

export default App
