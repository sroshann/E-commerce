import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Landing from './Pages/Landing/Landing'
import Login from './Pages/Login/Login'
import Signup from './Pages/Signup/Signup'
import ForgotPassword from './Pages/Forgot Password/ForgotPassword'

function App() {

    return (

        <>

            <Routes>

                <Route element={ <Landing /> } path='/' />
                <Route element={ <Login /> } path='/login' />
                <Route element={ <Signup /> } path='/signup' />
                <Route element={ <ForgotPassword /> } path='/forgotpassword' />

            </Routes>

            <Toaster />
            
        </>
        
    )
}

export default App
