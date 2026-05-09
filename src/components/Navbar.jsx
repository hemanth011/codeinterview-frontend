import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { logout } from '../store/authSlice'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(s => s.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const isActive = path => location.pathname === path

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">CI</span>
          </div>
          <span className="text-base font-semibold text-slate-800">CodeInterview</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
              ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            Dashboard
          </Link>

          {user?.role === 'INTERVIEWER' && (
            <>
              <Link
                to="/problems"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                  ${isActive('/problems') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Problems
              </Link>
              <Link
                to="/problems/create"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                  ${isActive('/problems/create') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Create Problem
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">{user?.name}</p>
            <p className="text-xs text-indigo-500 font-medium">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-red-500 transition font-medium px-2 py-1.5"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}