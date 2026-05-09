import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/axios'

const diffConfig = {
  EASY: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  MEDIUM: { color: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  HARD: { color: 'text-red-500 bg-red-50 border-red-200', dot: 'bg-red-500' },
}

export default function Problems() {
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [filtered, setFiltered] = useState([])
  const [keyword, setKeyword] = useState('')
  const [activeDiff, setActiveDiff] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/problems').then(res => {
      setProblems(res.data)
      setFiltered(res.data)
    }).finally(() => setLoading(false))
  }, [])

  const applyFilter = (kw, diff) => {
    let list = [...problems]
    if (kw.trim()) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(kw.toLowerCase()) ||
        p.tags?.toLowerCase().includes(kw.toLowerCase())
      )
    }
    if (diff !== 'ALL') {
      list = list.filter(p => p.difficulty === diff)
    }
    setFiltered(list)
  }

  const handleSearch = e => {
    setKeyword(e.target.value)
    applyFilter(e.target.value, activeDiff)
  }

  const handleDiff = d => {
    setActiveDiff(d)
    applyFilter(keyword, d)
  }

  const counts = {
    ALL: problems.length,
    EASY: problems.filter(p => p.difficulty === 'EASY').length,
    MEDIUM: problems.filter(p => p.difficulty === 'MEDIUM').length,
    HARD: problems.filter(p => p.difficulty === 'HARD').length,
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading problems...</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Problem Bank</h2>
            <p className="text-slate-500 text-sm mt-1">
              {problems.length} problems available
            </p>
          </div>
          <button
            onClick={() => navigate('/problems/create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Add Problem
          </button>
        </div>

        {/* filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                value={keyword}
                onChange={handleSearch}
                placeholder="Search by title or tag..."
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
              />
            </div>

            <div className="flex gap-2">
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
                <button
                  key={d}
                  onClick={() => handleDiff(d)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition
                    ${activeDiff === d
                      ? d === 'ALL'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : `${diffConfig[d]?.color} border-current`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                >
                  {d} ({counts[d]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* problems list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* table header */}
          <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3 border-b border-slate-100 bg-slate-50">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Problem</span>
            <span className="col-span-2">Difficulty</span>
            <span className="col-span-3">Tags</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-slate-600 font-medium">No problems found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try a different search term or filter
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((p, i) => {
                const dc = diffConfig[p.difficulty] || diffConfig.EASY
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition group"
                  >
                    <span className="col-span-1 text-sm text-slate-400 font-mono">
                      {i + 1}
                    </span>

                    <div className="col-span-5">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.testCases?.length || 0} test cases
                      </p>
                    </div>

                    <span className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${dc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dc.dot}`} />
                        {p.difficulty}
                      </span>
                    </span>

                    <div className="col-span-3 flex flex-wrap gap-1">
                      {p.tags ? p.tags.split(',').map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium"
                        >
                          {tag.trim()}
                        </span>
                      )) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => navigate(`/problems/${p.id}`)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}