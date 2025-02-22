import toast from 'react-hot-toast'
import { toastStyle } from '../Constants/constants'

// Validate logging data
export const validateLogin = values => {

    let error = {}
    const { email, password } = values

    // Email
    if( !email ) error.email = 'Email cannot be empty'
    else if( !email.includes('@') || email.split(" ").join("") != email ) error.email = 'Invalid mail' 

    // Password
    if( !password ) error.password = 'Password cannot be empty'
    else if( password.split(" ").join("") !== password ) error.password = 'Password includes spaces'

    if( Object.keys( error ).length > 0 ) return toast.error( Object.values(error)[0], { style : toastStyle } )
    else return

}

// Validate signup data
export const validateSignup = values => {

    let error = {}
    const { fullName, userName, email, phoneNumber, address, password, confirmPassword } = values

    // Full name
    if( !fullName ) error.fullName = 'Full name cannot be empty'
    else if( /\d/.test( fullName ) ) error.fullName = 'Full name contains a number'

    // User name
    if( !userName ) error.userName = 'Username cannot be empty'
    else if( userName.split(" ").join("") != userName ) error.userName = 'User name should not contain spaces'
    else if( userName.length < 3 ) error.userName = 'Create a longer username' 

    // Email
    if( !email ) error.email = 'Email cannot be empty'
    else if( !email.includes('@') || email.split(" ").join("") != email ) error.email = 'Invalid mail' 

    // Phone number
    if( !phoneNumber ) error.phoneNumber = 'Phone number cannot be empty'
    else if( phoneNumber.split(" ").join("") != phoneNumber || phoneNumber.length !== 10 || isNaN( phoneNumber ) ) 
        error.phoneNumber = 'Invalid phone number'

    // Address
    if( address && address.length < 5 ) error.address = 'Provide a proper address'

    // Password
    if( !password ) error.password = 'Password cannot be empty'
    else if( password.split(" ").join("") !== password ) error.password = 'Password includes spaces'
    else if( password.length < 6 ) error.password = 'Password needs atleast 6 characters'

    // Confirm password
    if( !confirmPassword ) error.confirmPassword = 'Password cannot be empty'
    else if( confirmPassword.split(" ").join("") !== confirmPassword ) error.confirmPassword = 'Password includes spaces'
    else if( confirmPassword.length < 6 ) error.confirmPassword = 'Password needs atleast 6 characters'

    // Checking password and confirm password
    if( password != confirmPassword ) error.missmatch = 'Password missmatches'

    if( Object.keys( error ).length > 0 ) return toast.error( Object.values(error)[0], { style : toastStyle } )
    else return

}