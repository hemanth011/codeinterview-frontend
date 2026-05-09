import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/axios'

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  WAITING: { label: 'Waiting', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ENDED: { label: 'Ended', color: 'text-slate-400 bg-slate-50 border-slate-200' },
}

export default function Dashboard() {
  const user = useSelector(s => s.auth.user)
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [roomForm, setRoomForm] = useState({
    problemId: '', candidateEmail: '', durationMinutes: 60
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [roomsRes, problemsRes] = await Promise.all([
        api.get('/rooms/my'),
        api.get('/problems'),
      ])
      setRooms(roomsRes.data)
      setProblems(problemsRes.data)
    } catch (e) {
      console.error('Dashboard load error', e)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async e => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await api.post('/rooms', roomForm)
      setRooms(prev => [res.data, ...prev])
      setShowModal(false)
      setRoomForm({ problemId: '', candidateEmail: '', durationMinutes: 60 })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Good day, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {user?.role === 'INTERVIEWER'
                ? 'Manage your interview rooms and problems'
                : 'View and join your scheduled interviews'}
            </p>
          </div>
          {user?.role === 'INTERVIEWER' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              <span className="text-base leading-none">+</span>
              New Interview Room
            </button>
          )}
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total Rooms',
              value: rooms.length,
              icon: '🏠',
              color: 'bg-indigo-50 border-indigo-100',
              textColor: 'text-indigo-600'
            },
            {
              label: 'Active Sessions',
              value: rooms.filter(r => r.status === 'ACTIVE').length,
              icon: '⚡',
              color: 'bg-emerald-50 border-emerald-100',
              textColor: 'text-emerald-600'
            },
            {
              label: 'Completed',
              value: rooms.filter(r => r.status === 'ENDED').length,
              icon: '✅',
              color: 'bg-slate-50 border-slate-200',
              textColor: 'text-slate-600'
            },
          ].map(stat => (
            <div
              key={stat.label}
              className={`border rounded-2xl p-5 ${stat.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* rooms section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Interview Rooms</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any room to enter the interview session
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
              {rooms.length} rooms
            </span>
          </div>

          {rooms.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-600 font-medium">No interview rooms yet</p>
              <p className="text-sm text-slate-400 mt-1 mb-4">
                {user?.role === 'INTERVIEWER'
                  ? 'Create your first room to get started'
                  : 'You have no scheduled interviews'}
              </p>
              {user?.role === 'INTERVIEWER' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                  Create Room
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {rooms.map(room => {
                const sc = statusConfig[room.status] || statusConfig.WAITING
                return (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/room/${room.roomCode}`)}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 text-sm font-bold">
                          {room.problem?.title?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                          {room.problem?.title || 'No problem selected'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">
                            {room.candidate?.name || 'Awaiting candidate'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">
                            {room.durationMinutes} min
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {room.roomCode?.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${sc.color}`}>
                        {sc.label}
                      </span>
                      {room.status === 'ENDED' && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            navigate(`/playback/${room.id}`)
                          }}
                          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition"
                        >
                          ▶ Playback
                        </button>
                      )}
                      <span className="text-slate-300 group-hover:text-indigo-400 transition">→</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* create room modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Create Interview Room</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Candidate will receive an email invite
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            <form onSubmit={createRoom} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Select Problem
                </label>
                <select
                  value={roomForm.problemId}
                  onChange={e => setRoomForm({ ...roomForm, problemId: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 bg-white text-slate-700"
                >
                  <option value="">Choose a problem...</option>
                  {problems.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {p.difficulty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Candidate Email
                </label>
                <input
                  type="email"
                  value={roomForm.candidateEmail}
                  onChange={e => setRoomForm({ ...roomForm, candidateEmail: e.target.value })}
                  placeholder="candidate@company.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Duration (minutes)
                </label>
                <div className="flex gap-2">
                  {[30, 45, 60, 90].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setRoomForm({ ...roomForm, durationMinutes: d })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition
                        ${roomForm.durationMinutes === d
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-sm text-slate-600 rounded-xl py-3 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl py-3 transition disabled:opacity-50 shadow-sm"
                >
                  {creating ? 'Creating...' : 'Create Room →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}