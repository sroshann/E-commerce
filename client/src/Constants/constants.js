import axios from 'axios'

export const toastStyle = {

    borderRadius: '10px',
    background: '#333',
    color: '#fff',
    fontSize : '14px'

}

export const axiosInstance = axios.create({

    baseURL : import.meta.env.MODE === 'development' ? 'http://localhost:3001' : '',
    withCredentials: true, // Important when sending cookies

})