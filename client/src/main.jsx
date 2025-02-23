import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import Store from './Store/Store.js'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(

    <StrictMode>

        <Provider store={ Store }>

            <Router>

                <App />

            </Router>

        </Provider>

    </StrictMode>,
    
)
