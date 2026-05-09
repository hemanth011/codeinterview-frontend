import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import api from '../utils/axios'

export default function Dashboard() {
  const user = useSelector(s => s.auth.user)
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  // modal state for creating a room
  const [showModal, setShowModal] = useState(false)
  const [roomForm, setRoomForm] = useState({
    problemId: '',
    candidateEmail: '',
    durationMinutes: 60,
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

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

  const statusColor = status => {
    if (status === 'ACTIVE') return 'text-green-600 bg-green-50'
    if (status === 'ENDED') return 'text-gray-400 bg-gray-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.name}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {user?.role === 'INTERVIEWER'
                ? 'Manage your interview rooms and problems'
                : 'View your scheduled interviews'}
            </p>
          </div>

          {user?.role === 'INTERVIEWER' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              + New Room
            </button>
          )}
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Rooms', value: rooms.length },
            { label: 'Active', value: rooms.filter(r => r.status === 'ACTIVE').length },
            { label: 'Completed', value: rooms.filter(r => r.status === 'ENDED').length },
          ].map(stat => (
            <div key={stat.label} className="border border-gray-100 rounded-xl p-5">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* rooms list */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Interview Rooms
          </h3>

          {rooms.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center">
              <p className="text-sm text-gray-400">No rooms yet.</p>
              {user?.role === 'INTERVIEWER' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 text-sm text-gray-900 underline"
                >
                  Create your first room
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between hover:border-gray-300 transition cursor-pointer"
                  onClick={() => navigate(`/room/${room.roomCode}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {room.problem?.title || 'No problem selected'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {room.candidate?.name || 'Awaiting candidate'} •{' '}
                      {room.durationMinutes} min
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(room.status)}`}>
                      {room.status}
                    </span>
                    {room.status === 'ENDED' && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          navigate(`/playback/${room.id}`)
                        }}
                        className="text-xs text-gray-400 hover:text-gray-900 transition underline"
                      >
                        Playback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* create room modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md shadow-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Create Interview Room</h3>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-4">
                {error}
              </p>
            )}

            <form onSubmit={createRoom} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Problem</label>
                <select
                  value={roomForm.problemId}
                  onChange={e => setRoomForm({ ...roomForm, problemId: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 bg-white"
                >
                  <option value="">Select a problem</option>
                  {problems.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {p.difficulty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Candidate Email</label>
                <input
                  type="email"
                  value={roomForm.candidateEmail}
                  onChange={e => setRoomForm({ ...roomForm, candidateEmail: e.target.value })}
                  placeholder="candidate@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={roomForm.durationMinutes}
                  onChange={e => setRoomForm({ ...roomForm, durationMinutes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-sm text-gray-600 rounded-lg py-2.5 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-gray-900 text-white text-sm rounded-lg py-2.5 hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}