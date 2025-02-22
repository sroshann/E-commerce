import React from "react"
import "./Login.css"
import { useLoginFromik, useLogout } from "../../Hooks/authenticationHooks";

const Login = () => {

    const formik = useLoginFromik() // Used to handle data validation
    const logout = useLogout() // Used to logout

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
                    <p className="register-link">Forgot password ?</p>
                    <p className="register-link">Don't have an account ? <a href="#">Sign Up</a></p>

                </form>
                <button onClick={ logout } type="submit" className="login-btn">Logout</button>

            </div>

        </div>

    );
    
};

export default Login;
