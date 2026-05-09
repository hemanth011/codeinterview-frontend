import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Problems from './pages/Problems'
import CreateProblem from './pages/CreateProblem'
import Room from './pages/Room'
import Playback from './pages/Playback'

// protect routes — redirect to login if not authenticated
const Private = ({ children }) => {
  const token = useSelector(s => s.auth.token)
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Private><Dashboard /></Private>} />
        <Route path="/problems" element={<Private><Problems /></Private>} />
        <Route path="/problems/create" element={<Private><CreateProblem /></Private>} />
        <Route path="/room/:roomCode" element={<Private><Room /></Private>} />
        <Route path="/playback/:roomId" element={<Private><Playback /></Private>} />
      </Routes>
    </BrowserRouter>
  )
}