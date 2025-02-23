import { useFormik } from 'formik'
import { validateForgotPassword, validateLogin, validateSignup } from "../lib/validations"
import { axiosInstance, toastStyle } from '../Constants/constants'
import { useDispatch } from 'react-redux' // Used to access the state functions inside Redux
import toast from 'react-hot-toast'
import { setChangePassword, setMailSend } from '../Store/authenticationReducer'

// Login formik
export const useLoginFromik = () => {

    const login = useLogin() // Used to login

    return useFormik({

        initialValues : {

            email : '',
            password : ''

        },
        validate : validateLogin,
        validateOnMount : false,
        validateOnChange :  false,
        validateOnBlur : false,
        onSubmit : values => login( values )

    })

}

// Login
export const useLogin = () => {

    return async ( values ) => {

        try {

            const response = await axiosInstance.post('/common/login', values)
            toast.success( response?.data?.message, { style : toastStyle } )

        } catch ( responseError ) 
            { toast.error( responseError?.response?.data?.error, { style : toastStyle } ) }

    }

}

// Logout
export const useLogout = () => {

    return async () => {

        try {

            const response = await axiosInstance.get('/common/logout')
            toast.success( response?.data?.message, { style : toastStyle } )

        } catch ( responseError ) 
            { toast.error( responseError?.response?.data?.error, { style : toastStyle } ) }

    }

}

// Signup formik
export const useSignupFormik = () => {

    const signup = useSignup() // Signup hook

    return useFormik ({

        initialValues : {

            fullName : '',
            userName : '',
            email : '',
            phoneNumber : '',
            address : '',
            password : '',
            confirmPassword : ''

        },
        validate : validateSignup,
        validateOnBlur : false,
        validateOnChange : false,
        validateOnMount : false,
        onSubmit : values => signup( values )

    })

}

// Signup
export const useSignup = () => {

    return async ( values ) => {

        try {

            const response = await axiosInstance.post('/common/signup', values)
            toast.success( response?.data?.message, { style : toastStyle } )

        } catch ( responseError ) 
            { toast.error( responseError?.response?.data?.error, { style : toastStyle } ) }

    }

}

// Forgot password formiks
export const useForgotPasswordFormik = () => {

    const mailOTP = useMailOTP() // Used to mail OTP
    const matchOTP = useMatchOTP() // Used to compare entered and mailed OTPs
    const changePassword = useChangePassword() // Used to change password

    const emailFormik = useFormik({

        initialValues : { email : '' },
        validateOnBlur : false,
        validateOnChange : false,
        validateOnMount : false,
        validate : validateForgotPassword.validateEmail,
        onSubmit : value => mailOTP( value )

    })

    const otpFormik = useFormik({

        initialValues : { otp : '' },
        validateOnBlur : false,
        validateOnChange : false,
        validateOnMount : false,
        validate : validateForgotPassword.validateOTP,
        onSubmit : value => matchOTP( value )

    })

    const passwordFormik = useFormik({

        initialValues : { 

            password : '',
            confirmPassword : ''

        },
        validateOnBlur : false,
        validateOnMount : false,
        validateOnChange : false,
        validate : validateForgotPassword.validatePassword,
        onSubmit : values => changePassword( values )

    })

    return { emailFormik, otpFormik, passwordFormik }

}

// Mail otp
export const useMailOTP = () => {

    const dispatch = useDispatch()
    return async ( values ) => {
        
        try {
            
            const loading = toast.loading('Loading', { style : toastStyle })
            const response = await axiosInstance.post('/common/mailOTP', values)
            dispatch( setMailSend() )
            toast.remove( loading )
            toast.success( response?.data?.message, { style : toastStyle } )
            
        } catch( responseError ) 
        { toast.error( responseError?.response?.data?.error, { style : toastStyle } ) }
        
    }

}

// Comparing mailed and entered OTP
export const useMatchOTP = () => {

    const dispatch = useDispatch()
    return async ( value ) => {

        try {

            const response = await axiosInstance.post('/common/validateOTP', value)
            dispatch( setChangePassword() )
            toast.success( response?.data?.message, { style : toastStyle } )

        } catch( responseError ) 
            { toast.error( responseError?.response?.data?.error, { style : toastStyle } ) }

    }

}

// Change password
export const useChangePassword = () => {

    return async ( values ) => {

        try {

            const response = await axiosInstance.put('/common/changePassword', values)
            toast.success( response?.data?.message, { style : toastStyle } )

        } catch ( responseError ) 
            { toast.error( responseError?.response?.data?.error, { style : toastStyle } ) }

    }

}   