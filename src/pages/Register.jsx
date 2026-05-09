import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/axios'

const roles = ['CANDIDATE', 'INTERVIEWER']

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CANDIDATE' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
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
            Start interviewing<br />smarter today
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Join hundreds of interviewers using CodeInterview to run better technical assessments.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: '4', desc: 'Languages supported' },
              { label: 'Live', desc: 'Code execution' },
              { label: 'P2P', desc: 'Video calling' },
              { label: '100%', desc: 'Session recorded' },
            ].map(s => (
              <div key={s.desc} className="bg-white/10 rounded-xl p-4">
                <p className="text-white font-bold text-xl">{s.label}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300 text-xs">© 2026 CodeInterview Platform</p>
      </div>

      {/* right register form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">CI</span>
            </div>
            <span className="font-semibold text-slate-800">CodeInterview</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
            <p className="text-slate-500 text-sm mt-1">Get started for free — no credit card required</p>
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
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handle}
                required
                placeholder="John Doe"
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition placeholder:text-slate-400"
              />
            </div>

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
                placeholder="Min 8 characters"
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                I am joining as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition
                      ${form.role === r
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    {r === 'CANDIDATE' ? '👨‍💻 Candidate' : '🎯 Interviewer'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}