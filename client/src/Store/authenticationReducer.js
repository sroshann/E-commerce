import { createSlice } from '@reduxjs/toolkit'

const initialState = {

    mailSend : false,
    changePassword : false

}

// Creating a slice for authentication
const authSlice = createSlice({

    name : 'authentication',
    initialState,
    reducers : {

        setMailSend : ( state, action ) => { state.mailSend = !state.mailSend },
        setChangePassword : ( state, action ) => { state.changePassword = !state.changePassword }

    }

})

export const { setMailSend, setChangePassword } = authSlice.actions
export default authSlice.reducer