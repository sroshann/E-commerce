import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'
import { useLogout } from '../../Hooks/authenticationHooks'

function Navbar() {

    const navigate = useNavigate()
    const logout = useLogout()
    const navigateTo = ( destination ) => {

        if( destination === 'home' ) navigate('/home')
        else if( destination === 'login' ) navigate('/login')
        else if( destination === 'signup' ) navigate('/signup')
        else if( destination === 'logout' ) {
    
            logout()
            navigate('/')
    
        }

    }

    return (

        <div>
            
            <button onClick={ () => navigateTo('home') }>Home</button>
            <button onClick={ () => navigateTo('login') }>Login</button>
            <button onClick={ () => navigateTo('signup') }>Signup</button>
            <button onClick={ () => navigateTo('logout') }>Logout</button>

        </div>
    )

}

export default Navbar