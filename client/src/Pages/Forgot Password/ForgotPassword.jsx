import React from 'react'
import { useSelector } from 'react-redux' // Used to access the state variables inside redux store
import './ForgotPassword.css'
import { useForgotPasswordFormik } from '../../Hooks/authenticationHooks'

function ForgotPassword() {

    // Redux state used to store auth state variables
    const { mailSend, changePassword } = useSelector( state => state.authentication )
    const { emailFormik, otpFormik, passwordFormik } = useForgotPasswordFormik() // Used to validate the data

    return (

        <div className="signup-container">

            <h1 style={{ width: 'fit-content' }}>Forgot password ?</h1>
            <div className="signup-form">

                <form onSubmit={emailFormik.handleSubmit}>

                    <label>

                        Enter email address
                        <input

                            type="text"
                            placeholder="Enter your mail address"
                            {...emailFormik.getFieldProps("email")}

                        />

                    </label>

                    <button type="submit" style={{ margin: '0px 0px 10px 0px' }}>Send OTP</button>

                </form>

                {mailSend &&

                    <form onSubmit={otpFormik.handleSubmit}>

                        <label>

                            Enter OTP
                            <input

                                type="text"
                                placeholder="Enter the OTP"
                                {...otpFormik.getFieldProps("otp")}

                            />

                        </label>

                        <button type="submit" style={{ margin: '0px 0px 10px 0px' }}>Validate OTP</button>

                    </form>

                }

                {changePassword && 
                
                    <form onSubmit={passwordFormik.handleSubmit}>

                        <label>

                            Password
                            <input

                                type="text"
                                placeholder="Enter your new password"
                                {...passwordFormik.getFieldProps("password")}

                            />

                        </label>

                        <label>

                            Confirm password
                            <input

                                type="text"
                                placeholder="Confirm your new passwprd"
                                {...passwordFormik.getFieldProps("confirmPassword")}

                            />

                        </label>

                        <button type="submit" style={{ margin: '0px 0px 10px 0px' }}>Change password</button>

                    </form>

                }

            </div>

        </div>

    )

}

export default ForgotPassword