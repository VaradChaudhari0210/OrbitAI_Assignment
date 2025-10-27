"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditorPage({ params }) {
  const router = useRouter()
  const [essayId, setEssayId] = useState(null)
  const [title, setTitle] = useState('')
  const [essayText, setEssayText] = useState('')
  const [targetUniversity, setTargetUniversity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    params.then(resolvedParams => {
      setEssayId(resolvedParams.essayId)
    })
  }, [params])

  useEffect(() => {
    if (essayId) {
      fetchEssay()
    }
  }, [essayId])

  async function fetchEssay() {
    try {
      const res = await fetch(`/api/essays/${essayId}`)
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch essay')
      }
      const data = await res.json()
      setTitle(data.essay.title)
      setEssayText(data.essay.content)
      setTargetUniversity(data.essay.targetUniversity || '')
      
      // Load previous analysis if available
      if (data.essay.analyses && data.essay.analyses.length > 0) {
        const latestAnalysis = data.essay.analyses[0]
        setFeedbackData({
          clarityScore: latestAnalysis.clarityScore,
          impactScore: latestAnalysis.impactScore,
          toneScore: latestAnalysis.toneScore,
          feedbackSummary: latestAnalysis.feedbackSummary,
          suggestions: latestAnalysis.suggestions
        })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAnalyze() {
    if (!essayText || essayText.trim().length === 0) {
      setError('Please write some content first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: essayText,
          targetUniversity: targetUniversity || null
        }),
      })

      if (!res.ok) {
        throw new Error('Analysis failed')
      }

      const data = await res.json()
      setFeedbackData(data.analysis)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/essays/${essayId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          content: essayText,
          targetUniversity: targetUniversity || null
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save essay')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this essay?')) {
      return
    }

    try {
      const res = await fetch(`/api/essays/${essayId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete essay')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRewrite() {
    if (!essayText || essayText.trim().length === 0) {
      setError('Please write some content first')
      return
    }

    if (!confirm('This will replace your current essay with an AI-rewritten version. Continue?')) {
      return
    }

    setIsRewriting(true)
    setError(null)

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: essayText,
          targetUniversity: targetUniversity || null,
          feedbackData: feedbackData || null
        }),
      })

      if (!res.ok) {
        throw new Error('Rewrite failed')
      }

      const data = await res.json()
      setEssayText(data.rewrittenText)
      
      // Auto-save the rewritten essay
      await handleSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRewriting(false)
    }
  }

  if (!essayId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  className="text-xl font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent p-0"
                  placeholder="Untitled Essay"
                />
                <input
                  type="text"
                  value={targetUniversity}
                  onChange={(e) => setTargetUniversity(e.target.value)}
                  onBlur={handleSave}
                  className="text-sm text-gray-600 border-none focus:outline-none focus:ring-0 bg-transparent p-0 mt-1"
                  placeholder="Target University (e.g., Stanford, MIT, Harvard)"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleSave}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Essay</h3>
              <span className="text-sm text-gray-500">
                {essayText.length} characters
              </span>
            </div>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              onBlur={handleSave}
              className="flex-1 w-full resize-none border-none focus:outline-none focus:ring-0 text-gray-900 leading-relaxed"
              placeholder="Start writing your essay here..."
            />
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || isRewriting || !essayText}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Essay'}
              </button>
              <button
                onClick={handleRewrite}
                disabled={isLoading || isRewriting || !essayText}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isRewriting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Rewriting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Rewrite with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Feedback Sidebar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Feedback</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
              </div>
            ) : feedbackData ? (
              <div className="space-y-6">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-4">
                  <ScoreCard label="Clarity" score={feedbackData.clarityScore} />
                  <ScoreCard label="Impact" score={feedbackData.impactScore} />
                  <ScoreCard label="Tone" score={feedbackData.toneScore} />
                </div>

                {/* Feedback Summary */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <h4 className="font-semibold text-cyan-900 mb-2">Summary</h4>
                  <p className="text-cyan-800 text-sm">{feedbackData.feedbackSummary}</p>
                </div>

                {/* Suggestions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Suggestions</h4>
                  <div className="space-y-3">
                    {feedbackData.suggestions.map((suggestion, index) => (
                      <SuggestionCard key={index} suggestion={suggestion} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4">
                  <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">No feedback yet</p>
                <p className="text-gray-500 text-sm">Click "Analyze Essay" to get AI-powered feedback</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ScoreCard({ label, score }) {
  const getColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <div className={`border rounded-lg p-4 text-center ${getColor(score)}`}>
      <div className="text-3xl font-bold mb-1">{score}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  )
}

function SuggestionCard({ suggestion }) {
  const categoryColors = {
    Clarity: 'bg-blue-100 text-blue-800',
    Impact: 'bg-purple-100 text-purple-800',
    Tone: 'bg-green-100 text-green-800',
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${categoryColors[suggestion.category] || 'bg-gray-100 text-gray-800'} mb-2`}>
        {suggestion.category}
      </span>
      <p className="text-sm text-gray-700 mb-2 italic">"{suggestion.originalText}"</p>
      <p className="text-sm text-gray-900">{suggestion.feedback}</p>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}
