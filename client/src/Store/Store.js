import { configureStore } from "@reduxjs/toolkit"
import authReducer from './authenticationReducer'

const Store = configureStore({

    reducer : {

        authentication : authReducer

    }

})

export default Store
