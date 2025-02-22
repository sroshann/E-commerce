import toast from 'react-hot-toast'
import { toastStyle } from '../Constants/constants'

// Validate logging data
export const validateLogin = ( values ) => {

    let error = {}
    const { email, password } = values

    // Email
    if( !email ) error.email = 'Email cannot be empty'
    else if( !email.includes('@') || email.trim() != email ) error.email = 'Invalid mail' 

    // Password
    if( !password ) error.password = 'Password cannot be empty'
    else if( password.trim() !== password ) error.password = 'Password includes spaces'

    if( Object.keys( error ).length > 0 ) return toast.error( Object.values(error)[0], { style : toastStyle } )
    else return

}