import React from "react"
import "./Login.css"
import { useGoogleAuth, useLoginFromik } from "../../Hooks/authenticationHooks";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const formik = useLoginFromik() // Used to handle data validation
    const googleAuth = useGoogleAuth() // Google authentication
    const navigate = useNavigate()

    return (

        <div className="login-container">

            <div className="login-box">

                <h2>Login</h2>
                <form onSubmit={ formik.handleSubmit }>

                    <div className="input-group">

                        <label>Email</label>
                        <input 
                        
                            type="text" 
                            placeholder="Enter your email"
                            { ...formik.getFieldProps("email") }
                            
                        />

                    </div>
                    <div className="input-group">

                        <label>Password</label>
                        <input 
                        
                            type="password" 
                            placeholder="Enter your password"
                            { ...formik.getFieldProps("password") }
                            
                        />

                    </div>
                    <button type="submit" className="login-btn">Login</button>
                    <p className="register-link" onClick={ () => navigate('/forgotpassword') }>Forgot password ?</p>
                    <p className="register-link" onClick={ () => navigate('/signup') }>Don't have an account ? Sign Up</p>

                </form>
                <button onClick={ googleAuth }>Google auth</button>

            </div>

        </div>

    );
    
};

export default Login;
