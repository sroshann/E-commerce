import React, { useEffect } from 'react'
import { useGetGooglAuthenticatedData } from '../../Hooks/authenticationHooks'
import './Home.css'
import Navbar from '../../Components/Navbar/Navbar'

function Home() {

    const getGoogleAuthData = useGetGooglAuthenticatedData()

    useEffect(() => {

        // In here this localStorage is designed as either 'true' or remove from localStorage
        // If the variable will not exist it value will be 'null', so the condition will trigger
        const googleAuth = JSON.parse(localStorage.getItem('googleAuth'))
        if ( googleAuth === true ) getGoogleAuthData()

    }, [])

    return (

        <div>

            <Navbar />
            <p>Home page</p>

        </div>

    )

}

export default Home