import React from "react";
import "./Signup.css";
import { useGoogleAuth, useSignupFormik } from "../../Hooks/authenticationHooks";
import { useNavigate } from "react-router-dom";

const Signup = () => {

    const formik = useSignupFormik()
    const googleAuth = useGoogleAuth() // Google authentication
    const navigate = useNavigate()

    return (

        <div className="signup-container">

            <h1>Submit your application</h1>
            <div className="signup-form">

                <form onSubmit={ formik.handleSubmit }>

                    <label>

                        Full Name
                        <input 
                        
                            type="text" 
                            placeholder="Enter your full name" 
                            { ...formik.getFieldProps("fullName") }
                            
                        />

                    </label>

                    <label>

                        Username
                        <input 
                            
                            type="text" 
                            placeholder="Enter your username" 
                            { ...formik.getFieldProps("userName") }
                            
                        />

                    </label>

                    <label>

                        Email
                        <input 
                        
                            type="text" 
                            placeholder="Enter your email" 
                            { ...formik.getFieldProps("email") }
                            
                        />

                    </label>

                    <label>

                        Phone Number
                        <input 
                        
                            type="text" 
                            placeholder="Enter your phone number" 
                            { ...formik.getFieldProps("phoneNumber") }
                            
                        />

                    </label>

                    <label>

                        Address
                        <input 
                        
                            type="text" 
                            placeholder="Enter your address" 
                            { ...formik.getFieldProps("address") }
                            
                        />

                    </label>

                    <label>

                        Password
                        <input 
                            
                            type="password" 
                            placeholder="Enter your password" 
                            { ...formik.getFieldProps('password') }
                            
                        />
                        
                    </label>

                    <label>
                        
                        Confirm Password
                        <input 
                        
                            type="password" 
                            placeholder="Enter your password" 
                            { ...formik.getFieldProps('confirmPassword') }
                            
                        />

                    </label>

                    <button type="submit">Submit</button>

                </form>

                <button onClick={ () => googleAuth() }>Sign up with google</button>
                <p onClick={ () => navigate('/login') }>Already have account? Login</p>

            </div>

        </div>

    );

};

export default Signup;
