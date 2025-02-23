import toast from 'react-hot-toast'
import { toastStyle } from '../Constants/constants'

const validateEmail = (email) => {

    let error
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) error = 'Email cannot be empty'
    else if (!emailRegex.test(email) || email.split(" ").join("") != email)
        error = 'Invalid mail'
    return error

}

const validatePassword = (parameters, isConfirm = false) => {

    const { password, confirmPassword } = parameters
    let error = {}

    // Password
    if (!password) error.passwordError = 'Password cannot be empty'
    else if (password.split(" ").join("") !== password) error.passwordError = 'Password includes spaces'
    else if (password.length < 6) error.passwordError = 'Password needs atleast 6 characters'

    if (isConfirm) {

        // Confirm password
        if (!confirmPassword) error.confirmError = 'Password cannot be empty'
        else if (confirmPassword.split(" ").join("") !== confirmPassword) error.confirmError = 'Password includes spaces'
        else if (confirmPassword.length < 6) error.confirmError = 'Password needs atleast 6 characters'

        if (password != confirmPassword) error.missmatch = 'Password missmatches'

    }

    return Object.keys(error).length ? error : null

}

const validatePhoneNumber = ( phoneNumber ) => {

    let error
    if (!phoneNumber) error = 'Phone number cannot be empty'
    else if (phoneNumber.split(" ").join("") != phoneNumber || phoneNumber.length !== 10 || isNaN(phoneNumber))
        error = 'Invalid phone number'
    return error

}

// Validate logging data
export const validateLogin = values => {

    let error = {}
    const { email, password } = values

    // Email
    let emailError = validateEmail(email)
    if (emailError) error.email = emailError

    // Password
    let passwordError = validatePassword({ password })
    if (passwordError) error.password = passwordError.passwordError

    return Object.keys(error).length ? toast.error(Object.values(error)[0], { style: toastStyle }) : null

}

// Validate signup data
export const validateSignup = values => {

    let error = {}
    const { fullName, userName, email, phoneNumber, address, password, confirmPassword } = values

    // Full name
    if (!fullName) error.fullName = 'Full name cannot be empty'
    else if (/\d/.test(fullName)) error.fullName = 'Full name contains a number'

    // User name
    if (!userName) error.userName = 'Username cannot be empty'
    else if (userName.split(" ").join("") != userName) error.userName = 'User name should not contain spaces'
    else if (userName.length < 3) error.userName = 'Create a longer username'

    // Email
    let emailError = validateEmail(email)
    if (emailError) error.email = emailError

    // Phone number
    let phoneNumberError = validatePhoneNumber( phoneNumber )
    if( phoneNumberError ) error.phoneNumber = phoneNumberError

    // Address
    if (address && address.length < 5) error.address = 'Provide a proper address'

    // Password
    let checkingPasswords = validatePassword({ password, confirmPassword }, true)
    if (checkingPasswords) {

        const { passwordError, confirmError, missmatch } = checkingPasswords
        if (passwordError) error.password = passwordError
        else if (confirmError) error.confirmPassword = confirmError
        else if (missmatch) error.missmatch = missmatch

    }

    return Object.keys(error).length ? toast.error(Object.values(error)[0], { style: toastStyle }) : null

}

// Validate forgot password
export const validateForgotPassword = {

    validateEmail: ({ email }) => {

        let emailError = validateEmail(email)
        if (emailError) return toast.error(emailError, { style: toastStyle })

    },

    validateOTP: ({ otp }) => {

        if (!otp) return toast.error('OTP cannot be empty', { style: toastStyle })
        else if (otp.split(" ").join("") != otp || otp.length !== 6 || isNaN(otp))
            return toast.error('Invalid OTP', { style: toastStyle })

    },

    validatePassword: ({ password, confirmPassword }) => {

        let error = {}
        let checkingPasswords = validatePassword({ password, confirmPassword }, true)
        if (checkingPasswords) {

            const { passwordError, confirmError, missmatch } = checkingPasswords
            if (passwordError) error.password = passwordError
            else if (confirmError) error.confirmPassword = confirmError
            else if (missmatch) error.missmatch = missmatch

        }
        return Object.keys(error).length ? toast.error(Object.values(error)[0], { style: toastStyle }) : null

    }

}