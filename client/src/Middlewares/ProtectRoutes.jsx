import { useSelector } from "react-redux"
import { Navigate, useLocation } from 'react-router-dom'

export const ProtectAuth = ({ children }) => {

    // This will protect the 'login' and 'signup' from accessing even after completing authentication
    const { isAuthenticated } = useSelector( state => state.authentication )
    if( isAuthenticated ) return <Navigate to={ '/' } replace />
    return children

}

export const ProtectFeatures = ({ children }) => {

    // This will protect other routes from accessing without authentication
    const { isAuthenticated } = useSelector( state => state.authentication )
    const location = useLocation()
    if( !isAuthenticated ) return <Navigate to={'/login'} state={{ from : location }} replace />
    return children

}