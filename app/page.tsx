'use client'

import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'

interface LeetCodeStats {
  status: string
  totalSolved: number
  totalQuestions: number
  easySolved: number
  totalEasy: number
  mediumSolved: number
  totalMedium: number
  hardSolved: number
  totalHard: number
  acceptanceRate: number
  ranking: number
  contributionPoints: number
  reputation: number
}  async function getLeetCodeStats(username: string): Promise<LeetCodeStats> {
  const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found')
    }
    throw new Error('Failed to fetch LeetCode stats. Please try again later.')
  }
  try {
    return await response.json()
  } catch (_err) {
    throw new Error('Invalid response from LeetCode API')
  }
}

export default function Home() {
  const [username, setUsername] = useState('')
  const [data, setData] = useState<LeetCodeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const receiptRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (receiptRef.current) {
      const dataUrl = await toPng(receiptRef.current, { quality: 0.95 })
      const link = document.createElement('a')
      link.download = `leetcode-receipt-${username}.png`
      link.href = dataUrl
      link.click()
    }
  }

  const handleShare = async () => {
    if (!receiptRef.current) return

    try {
      const dataUrl = await toPng(receiptRef.current)
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'leetcode-receipt.png', { type: 'image/png' })

      if (navigator.share) {
        try {
          // Try sharing with file first
          if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'My LeetCode Receipt',
              text: `Check out my LeetCode stats for ${username}!`,
              files: [file]
            })
          } else {
            // Fall back to text-only sharing if file sharing not supported
            await navigator.share({
              title: 'My LeetCode Receipt',
              text: `Check out my LeetCode stats for ${username}!`,
              url: `https://leetcode.com/${username}`
            })
          }
        } catch (_err) {
          // If sharing fails, fall back to download
          handleDownload()
        }
      } else {
        handleDownload()
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username) return
    
    setLoading(true)
    setError('')
    
    try {
      const stats = await getLeetCodeStats(username)
      setData(stats)
    } catch (_err) {
      setError('User not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-zinc-900 dark:text-white">
          LeetCode Receipt
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Generate a receipt-style summary of your LeetCode profile
        </p>

      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter LeetCode username"
            autoCapitalize="none"
            autoComplete="off"
            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 
                     border border-zinc-200 dark:border-zinc-700 
                     text-zinc-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     dark:focus:ring-blue-400 font-mono text-[16px]"
          />
          <button
            type="submit"
            disabled={!username || loading}
            className="px-4 sm:px-6 py-2 rounded-lg bg-blue-500 text-white font-medium
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm sm:text-base"
          >
            Generate
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 mb-4">{error}</div>
      )}

      {data && (
        <div className="flex flex-col items-center">
          <div className="receipt-container">
            <div className="coffee-stain" />
            <div ref={receiptRef} className="receipt-content w-full max-w-[88mm] bg-white text-black">
              <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-xs leading-relaxed">
                <div className="text-center mb-6">
                  <h2 className="text-base sm:text-lg font-bold">LEETCODE RECEIPT</h2>
                  <p>{new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }).toUpperCase()}</p>
                  <p className="mt-1 opacity-75">ORDER #{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}</p>
                </div>

                <div className="mb-4">
                  <p>CUSTOMER: {username.toUpperCase()}</p>
                </div>

                <div className="border-t border-b border-dashed py-3 mb-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>TOTAL SOLVED</td>
                        <td className="text-right">{data.totalSolved}</td>
                      </tr>
                      <tr>
                        <td>EASY SOLVED</td>
                        <td className="text-right">{data.easySolved}</td>
                      </tr>
                      <tr>
                        <td>MEDIUM SOLVED</td>
                        <td className="text-right">{data.mediumSolved}</td>
                      </tr>
                      <tr>
                        <td>HARD SOLVED</td>
                        <td className="text-right">{data.hardSolved}</td>
                      </tr>
                      <tr>
                        <td>ACCEPTANCE RATE</td>
                        <td className="text-right">{data.acceptanceRate.toFixed(2)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-dashed pt-3 mb-4">
                  <div className="flex justify-between">
                    <span>RANKING:</span>
                    <span>{data.ranking}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CONTRIBUTION POINTS:</span>
                    <span>{data.contributionPoints}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>REPUTATION:</span>
                    <span>{data.reputation}</span>
                  </div>
                </div>

                <div className="text-center opacity-75 mb-4">
                  <p>Served by: LeetCode Bot</p>
                  <p>{new Date().toLocaleTimeString()}</p>
                </div>

                <div className="border-t border-dashed pt-4 mb-4 text-center">
                  <p>COUPON CODE: {Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                  <p className="text-xs opacity-75">Save for your next coding session!</p>
                </div>

                <div className="text-center">
                  <p className="mb-4">KEEP CODING AND LEVELING UP!</p>
                  <p className="mt-2 opacity-75">leetcode.com/{username}</p>
                </div>
              </div>
              <div className="receipt-fade" />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg 
                       text-zinc-900 dark:text-white
                       hover:bg-zinc-100 dark:hover:bg-zinc-700 
                       transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg
                       text-zinc-900 dark:text-white
                       hover:bg-zinc-100 dark:hover:bg-zinc-700 
                       transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

