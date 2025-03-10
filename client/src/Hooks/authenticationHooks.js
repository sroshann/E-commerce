import { useFormik } from 'formik'
import { validateForgotPassword, validateLogin, validateSignup } from "../lib/validations"
import { axiosInstance, toastStyle } from '../Constants/constants'
import { useDispatch, useSelector } from 'react-redux' // Used to access the state functions inside Redux
import toast from 'react-hot-toast'
import { setChangePassword, setIsAuthenticated, setMailSend, setUserDetails } from '../Store/authenticationReducer'
import { useLocation, useNavigate } from 'react-router-dom'

// Google authentication
export const useGoogleAuth = () => {

    const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3001' : ''
    return async () => {

        try {

            window.open(
                
                `${ BASE_URL }/common/google/redirect`,
                "_self"
            
            )
            // Setting this variable inorder to retreive authenticated user data
            // Localstorage is due
            localStorage.setItem('googleAuth', JSON.stringify( true ))
            
        } catch( error ) { console.log( error ) }
        
    }

}

// Get google authenticated data
export const useGetGooglAuthenticatedData = () => {

    const dispatch = useDispatch()

    return async () => {

        try {

            const response = await axiosInstance.get('/common/google/auth/success')
            const { message, userDetails } = response?.data
            dispatch( setUserDetails( userDetails ) )
            dispatch( setIsAuthenticated() )
            localStorage.removeItem('googleAuth')
            toast.success( message, { style: toastStyle } )


        } catch( responseError ) 
            { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}

// Login formik
export const useLoginFromik = () => {

    const login = useLogin() // Used to login

    return useFormik({

        initialValues: {

            email: '',
            password: ''

        },
        validate: validateLogin,
        validateOnMount: false,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: values => login(values)

    })

}

// Login
export const useLogin = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    return async (values) => {

        try {

            const response = await axiosInstance.post('/common/login', values)
            const { message, userDetails } = response?.data
            dispatch( setUserDetails( userDetails ) ) // Setting the loged user details to store
            dispatch( setIsAuthenticated() )
            toast.success( message, { style: toastStyle } )
            // Navigate to previously used routes
            navigate( location?.state?.from?.pathname || '/', { replace : true } )

        } catch (responseError) 
            { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}

// Logout
export const useLogout = () => {

    const dispatch = useDispatch()
    return async () => {

        try {

            const response = await axiosInstance.get('/common/logout')
            dispatch( setUserDetails( null ) ) // Clearing userDetails
            dispatch( setIsAuthenticated() )
            toast.success(response?.data?.message, { style: toastStyle })

        } catch (responseError) { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}

// Signup formik
export const useSignupFormik = () => {

    const signup = useSignup() // Signup hook

    return useFormik({

        initialValues: {

            fullName: '',
            userName: '',
            email: '',
            phoneNumber: '',
            address: '',
            password: '',
            confirmPassword: ''

        },
        validate: validateSignup,
        validateOnBlur: false,
        validateOnChange: false,
        validateOnMount: false,
        onSubmit: values => signup(values)

    })

}

// Signup
export const useSignup = () => {

    const dispatch = useDispatch()
    return async (values) => {

        try {

            const response = await axiosInstance.post('/common/signup', values)
            const { message, userDetails } = response?.data
            dispatch( setUserDetails( userDetails ) ) // Setting user details to store
            dispatch( setIsAuthenticated() )
            toast.success( message, { style: toastStyle } )

        } catch (responseError) { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}

// Forgot password formiks
export const useForgotPasswordFormik = () => {

    const mailOTP = useMailOTP() // Used to mail OTP
    const matchOTP = useMatchOTP() // Used to compare entered and mailed OTPs
    const changePassword = useChangePassword() // Used to change password

    const emailFormik = useFormik({

        initialValues: { email: '' },
        validateOnBlur: false,
        validateOnChange: false,
        validateOnMount: false,
        validate: validateForgotPassword.validateEmail,
        onSubmit: value => mailOTP(value)

    })

    const otpFormik = useFormik({

        initialValues: { otp: '' },
        validateOnBlur: false,
        validateOnChange: false,
        validateOnMount: false,
        validate: validateForgotPassword.validateOTP,
        onSubmit: value => matchOTP(value)

    })

    const passwordFormik = useFormik({

        initialValues: {

            password: '',
            confirmPassword: ''

        },
        validateOnBlur: false,
        validateOnMount: false,
        validateOnChange: false,
        validate: validateForgotPassword.validatePassword,
        onSubmit: values => changePassword(values)

    })

    return { emailFormik, otpFormik, passwordFormik }

}

// Mail otp
export const useMailOTP = () => {

    const dispatch = useDispatch()
    return async (values) => {

        try {

            const loading = toast.loading('Loading', { style: toastStyle })
            const response = await axiosInstance.post('/common/mailOTP', values)
            dispatch(setMailSend())
            toast.remove(loading)
            toast.success(response?.data?.message, { style: toastStyle })

        } catch (responseError) { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}

// Comparing mailed and entered OTP
export const useMatchOTP = () => {

    const dispatch = useDispatch()
    return async (value) => {

        try {

            const response = await axiosInstance.post('/common/validateOTP', value)
            dispatch(setChangePassword())
            toast.success(response?.data?.message, { style: toastStyle })

        } catch (responseError) { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}

// Change password
export const useChangePassword = () => {

    return async (values) => {

        try {

            const response = await axiosInstance.put('/common/changePassword', values)
            toast.success(response?.data?.message, { style: toastStyle })

        } catch (responseError) { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}

// Get user details
export const useGetUserDetails = () => {

    const { userDetails } = useSelector( state => state.authentication )
    const dispatch = useDispatch()
    return async () => {

        try {

            if( userDetails === null || Object.keys( userDetails ).length === 0 ) {

                const response = await axiosInstance.get('/common/getUserDetails')
                const { user } = response?.data
                dispatch( setUserDetails( user ) )

            } else return

        } catch ( responseError ) 
            { toast.error(responseError?.response?.data?.error, { style: toastStyle }) }

    }

}