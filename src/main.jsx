import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './app/store'
import { initApiInterceptors } from './services/api'
import { setAccessToken } from './features/auth/authSlice'
import './styles/responsive.css'

initApiInterceptors({
  getAccessToken: () => store.getState()?.auth?.accessToken,
  setAccessToken: (token) => store.dispatch(setAccessToken(token)),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
)
