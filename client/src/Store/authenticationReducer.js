import { createSlice } from '@reduxjs/toolkit'

const initialState = {

    mailSend : false,
    changePassword : false,
    userDetails : {}

}

// Creating a slice for authentication
const authSlice = createSlice({

    name : 'authentication',
    initialState,
    reducers : {

        setMailSend : ( state, action ) => { state.mailSend = !state.mailSend },
        setChangePassword : ( state, action ) => { state.changePassword = !state.changePassword },
        setUserDetails : ( state, action ) => { state.userDetails = action.payload }

    }

})

export const { setMailSend, setChangePassword, setUserDetails } = authSlice.actions
export default authSlice.reducer