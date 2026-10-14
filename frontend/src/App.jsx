import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage/LandingPage'
import RegisterUser from './pages/Register/RegisterUser'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/get-started' element={<RegisterUser />} />
        <Route path='/login' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
