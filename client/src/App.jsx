import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Landing from './Pages/Landing/Landing'
import Login from './Pages/Login/Login'
import Signup from './Pages/Signup/Signup'

function App() {

    return (

        <>

            <Routes>

                <Route element={ <Landing /> } path='/' />
                <Route element={ <Login /> } path='/login' />
                <Route element={ <Signup /> } path='/signup' />

            </Routes>

            <Toaster />
            
        </>
        
    )
}

export default App
