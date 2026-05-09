import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/axios'

const LANGUAGES = ['JAVA', 'PYTHON', 'JAVASCRIPT', 'CPP']
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']

const diffConfig = {
  EASY: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  MEDIUM: 'border-amber-500 bg-amber-50 text-amber-700',
  HARD: 'border-red-500 bg-red-50 text-red-700',
}

export default function CreateProblem() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    tags: '',
  })

  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', isHidden: false, label: '' }
  ])

  const [starterCodes, setStarterCodes] = useState([
    { language: 'PYTHON', code: '' }
  ])

  const handleForm = e => setForm({ ...form, [e.target.name]: e.target.value })

  const updateTestCase = (i, field, value) => {
    const updated = [...testCases]
    updated[i] = { ...updated[i], [field]: value }
    setTestCases(updated)
  }

  const updateStarterCode = (i, field, value) => {
    const updated = [...starterCodes]
    updated[i] = { ...updated[i], [field]: value }
    setStarterCodes(updated)
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/problems', { ...form, testCases, starterCodes })
      navigate('/problems')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create problem')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'details', label: '📝 Details' },
    { id: 'testcases', label: `🧪 Test Cases (${testCases.length})` },
    { id: 'starter', label: `💻 Starter Code (${starterCodes.length})` },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/problems')}
            className="text-slate-400 hover:text-slate-600 transition text-sm"
          >
            ← Back
          </button>
          <span className="text-slate-300">/</span>
          <h2 className="text-xl font-bold text-slate-800">Create Problem</h2>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* tabs */}
            <div className="flex border-b border-slate-100">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3.5 text-sm font-medium transition border-b-2
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* details tab */}
              {activeTab === 'details' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Problem Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleForm}
                      required
                      placeholder="e.g. Two Sum, Binary Search..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Problem Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleForm}
                      required
                      rows={6}
                      placeholder="Describe the problem clearly. Include constraints and examples..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Difficulty Level
                    </label>
                    <div className="flex gap-3">
                      {DIFFICULTIES.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setForm({ ...form, difficulty: d })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition
                            ${form.difficulty === d
                              ? diffConfig[d]
                              : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                          {d === 'EASY' ? '🟢' : d === 'MEDIUM' ? '🟡' : '🔴'} {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Tags
                      <span className="text-slate-400 font-normal ml-1">(comma separated)</span>
                    </label>
                    <input
                      name="tags"
                      value={form.tags}
                      onChange={handleForm}
                      placeholder="arrays, hashmap, two-pointers, dp..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                    />
                    {form.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.tags.split(',').filter(t => t.trim()).map(tag => (
                          <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-full font-medium">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* test cases tab */}
              {activeTab === 'testcases' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Add visible and hidden test cases
                    </p>
                    <button
                      type="button"
                      onClick={() => setTestCases([...testCases,
                        { input: '', expectedOutput: '', isHidden: false, label: '' }])}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                    >
                      + Add Test Case
                    </button>
                  </div>

                  {testCases.map((tc, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-500">
                            Test Case {i + 1}
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.isHidden}
                              onChange={e => updateTestCase(i, 'isHidden', e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600"
                            />
                            <span className="text-xs text-slate-500">Hidden</span>
                          </label>
                          {tc.isHidden && (
                            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                              🔒 Hidden from candidate
                            </span>
                          )}
                        </div>
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTestCases(testCases.filter((_, idx) => idx !== i))}
                            className="text-xs text-red-400 hover:text-red-600 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <input
                          value={tc.label}
                          onChange={e => updateTestCase(i, 'label', e.target.value)}
                          placeholder="Label (e.g. Basic case, Edge case...)"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 transition"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">
                              Input (stdin)
                            </label>
                            <textarea
                              value={tc.input}
                              onChange={e => updateTestCase(i, 'input', e.target.value)}
                              rows={4}
                              placeholder="4&#10;2 7 11 15&#10;9"
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-indigo-400 transition resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">
                              Expected Output (stdout)
                            </label>
                            <textarea
                              value={tc.expectedOutput}
                              onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)}
                              rows={4}
                              placeholder="0 1"
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-indigo-400 transition resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* starter code tab */}
              {activeTab === 'starter' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Boilerplate code shown to candidates
                    </p>
                    <button
                      type="button"
                      onClick={() => setStarterCodes([...starterCodes,
                        { language: 'JAVA', code: '' }])}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                    >
                      + Add Language
                    </button>
                  </div>

                  {starterCodes.map((sc, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <select
                          value={sc.language}
                          onChange={e => updateStarterCode(i, 'language', e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-400 bg-white font-medium text-slate-700"
                        >
                          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                        </select>
                        {starterCodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setStarterCodes(
                              starterCodes.filter((_, idx) => idx !== i))}
                            className="text-xs text-red-400 hover:text-red-600 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <textarea
                        value={sc.code}
                        onChange={e => updateStarterCode(i, 'code', e.target.value)}
                        rows={8}
                        placeholder="# Write starter code here..."
                        className="w-full px-4 py-3 text-sm font-mono outline-none resize-none border-0 focus:ring-0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => navigate('/problems')}
              className="flex-1 border border-slate-200 text-sm text-slate-600 font-medium rounded-xl py-3 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl py-3 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creating...' : '✓ Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}