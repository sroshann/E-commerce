import { useFormik } from 'formik'
import { validateLogin, validateSignup } from "../lib/validations"
import { axiosInstance, toastStyle } from '../Constants/constants'
import toast from 'react-hot-toast'

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