import { Route, Routes } from 'react-router-dom'
import Landing from './Pages/Landing/Landing'
import Login from './Pages/Login/Login'
import { Toaster } from 'react-hot-toast'

function App() {

    return (

        <>

            <Routes>

                <Route element={ <Landing /> } path='/' />
                <Route element={ <Login /> } path='/login' />

            </Routes>

            <Toaster />
            
        </>
        
    )
}

export default App
