import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setAuth } from '../store/authSlice'
import api from '../utils/axios'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      dispatch(setAuth({ token: res.data.token, user: res.data }))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CI</span>
          </div>
          <span className="text-white font-semibold text-lg">CodeInterview</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Conduct better<br />technical interviews
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Real-time collaborative coding, live video, and instant execution — everything you need in one platform.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '⚡', text: 'Run code in isolated Docker containers' },
              { icon: '🎥', text: 'Peer-to-peer video calling built in' },
              { icon: '▶', text: 'Replay entire sessions keystroke by keystroke' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <p className="text-indigo-100 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300 text-xs">
          © 2026 CodeInterview Platform
        </p>
      </div>

      {/* right login form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">

          {/* mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">CI</span>
            </div>
            <span className="font-semibold text-slate-800">CodeInterview</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Email address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                required
                placeholder="you@example.com"
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                required
                placeholder="Enter your password"
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}