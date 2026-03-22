import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './app/store'
import { initApiInterceptors } from './services/api'
import { setAccessToken, setRefreshToken } from './features/auth/authSlice'
import './styles/responsive.css'

// Logs de debug para ambiente e dispositivo
const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
console.log('🚀 Aplicação iniciando...');
console.log('📱 Dispositivo:', isMobile ? 'Mobile' : 'Desktop');
console.log('🌐 User Agent:', navigator.userAgent);
console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
console.log('🔀 Usar Proxy Vercel:', import.meta.env.VITE_USE_VERCEL_PROXY);
console.log('🍪 Cookies iniciais:', document.cookie || 'Nenhum cookie');

initApiInterceptors({
  getAccessToken: () => store.getState()?.auth?.accessToken,
  setAccessToken: (token) => store.dispatch(setAccessToken(token)),
  getRefreshToken: () => store.getState()?.auth?.refreshToken,
  setRefreshToken: (token) => store.dispatch(setRefreshToken(token)),
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
