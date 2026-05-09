import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import Navbar from '../components/Navbar'
import api from '../utils/axios'

export default function Playback() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentCode, setCurrentCode] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  const timeoutRef = useRef(null)
  const indexRef = useRef(0)

  useEffect(() => {
    loadPlayback()
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const loadPlayback = async () => {
    try {
      const res = await api.get(`/playback/room/${roomId}`)
      setEvents(res.data)
      if (res.data.length > 0) setCurrentCode(res.data[0].content)
    } catch (e) {
      console.error('Playback load error', e)
    } finally {
      setLoading(false)
    }
  }

  const startPlayback = () => {
    if (events.length === 0) return
    setPlaying(true)
    indexRef.current = 0
    playNext()
  }

  const playNext = () => {
    const idx = indexRef.current
    if (idx >= events.length) {
      setPlaying(false)
      return
    }
    const current = events[idx]
    const next = events[idx + 1]
    setCurrentCode(current.content)
    setCurrentIndex(idx)
    setProgress(Math.round((idx / events.length) * 100))
    if (next) {
      const delay = Math.min(next.offsetMs - current.offsetMs, 2000)
      indexRef.current = idx + 1
      timeoutRef.current = setTimeout(playNext, Math.max(delay, 100))
    } else {
      setPlaying(false)
      setProgress(100)
    }
  }

  const stopPlayback = () => {
    clearTimeout(timeoutRef.current)
    setPlaying(false)
  }

  const reset = () => {
    stopPlayback()
    setCurrentIndex(0)
    setProgress(0)
    if (events.length > 0) setCurrentCode(events[0].content)
  }

  const formatDuration = () => {
    if (events.length === 0) return '0s'
    const ms = events[events.length - 1].offsetMs
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading playback...</span>
        </div>
      </div>
    </div>
  )

  if (events.length === 0) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-4xl">📭</div>
        <p className="text-slate-600 font-medium">No playback data available</p>
        <p className="text-sm text-slate-400">
          Interview may still be active or no editor events were recorded
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex-1 flex flex-col">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-slate-600 transition text-sm"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Session Playback</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {events.length} events recorded • {formatDuration()} total duration
              </p>
            </div>
          </div>

          {/* playback stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-indigo-600">{events.length}</p>
              <p className="text-xs text-slate-400">Events</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{formatDuration()}</p>
              <p className="text-xs text-slate-400">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{progress}%</p>
              <p className="text-xs text-slate-400">Progress</p>
            </div>
          </div>
        </div>

        {/* main content */}
        <div className="flex gap-5 flex-1">

          {/* editor */}
          <div className="flex-1 flex flex-col gap-4">

            {/* progress + controls */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-4 mb-3">
                {!playing ? (
                  <button
                    onClick={startPlayback}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-sm"
                  >
                    ▶ Play Session
                  </button>
                ) : (
                  <button
                    onClick={stopPlayback}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-sm"
                  >
                    ⏸ Pause
                  </button>
                )}

                <button
                  onClick={reset}
                  className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  ↺ Reset
                </button>

                <span className="text-sm text-slate-400 ml-auto">
                  Event <span className="font-semibold text-slate-600">{currentIndex + 1}</span> of{' '}
                  <span className="font-semibold text-slate-600">{events.length}</span>
                </span>
              </div>

              {/* progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* monaco editor */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-96">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-slate-400 ml-2 font-mono">
                  session-replay.py
                </span>
                {playing && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Playing
                  </span>
                )}
              </div>
              <Editor
                height="500px"
                language="python"
                value={currentCode}
                options={{
                  readOnly: true,
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  lineNumbers: 'on',
                  automaticLayout: true,
                  theme: 'vs',
                }}
              />
            </div>
          </div>

          {/* event log sidebar */}
          <div className="w-64 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-700">Event Log</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keystroke history
                </p>
              </div>
              <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-slate-50">
                {events.map((e, i) => (
                  <div
                    key={e.id}
                    className={`px-3 py-2.5 transition
                      ${i === currentIndex
                        ? 'bg-indigo-50 border-l-2 border-indigo-500'
                        : i < currentIndex
                          ? 'opacity-40'
                          : ''}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-slate-600">
                        {e.user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {Math.floor(e.offsetMs / 1000)}s
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      {e.content?.slice(0, 30)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}