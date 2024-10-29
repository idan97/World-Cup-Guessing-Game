'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clock, Trophy, MessageCircle, Settings, Users, Calendar, BookOpen, BarChart, Award, Cog } from 'lucide-react'
import axios from 'axios'

// Interfaces (unchanged)
interface Player {
  rank: number
  name: string
  score: number
}

interface Summary {
  date: string
  content: string
}

interface MatchResult {
  id: string
  date: string
  homeTeam: string
  awayTeam: string
  prediction: {
    homeScore: number
    awayScore: number
  }
  actual: {
    homeScore: number
    awayScore: number
  }
  points: number
}

interface TournamentTopThree {
  year: number
  winners: Player[]
}

// Mock data (unchanged)
const API_URL = 'http://127.0.0.1:8000'

const mockLeaderboard: Player[] = [
  { rank: 1, name: 'John Doe', score: 120 },
  { rank: 2, name: 'Jane Smith', score: 115 },
  { rank: 3, name: 'Bob Johnson', score: 110 },
  { rank: 4, name: 'Alice Williams', score: 105 },
  { rank: 5, name: 'Charlie Brown', score: 100 },
  { rank: 6, name: 'David Miller', score: 95 },
  { rank: 7, name: 'Eva Green', score: 90 },
  { rank: 8, name: 'Frank White', score: 85 },
  { rank: 9, name: 'Grace Young', score: 80 },
  { rank: 10, name: 'Henry Taylor', score: 75 },
]

const mockPastTournaments: TournamentTopThree[] = [
  {
    year: 2022,
    winners: [
      { rank: 1, name: 'Michael Johnson', score: 150 },
      { rank: 2, name: 'Sarah Davis', score: 145 },
      { rank: 3, name: 'Robert Wilson', score: 140 },
    ]
  },
  {
    year: 2018,
    winners: [
      { rank: 1, name: 'Elena Rodriguez', score: 148 },
      { rank: 2, name: 'Thomas Brown', score: 142 },
      { rank: 3, name: 'Yuki Tanaka', score: 139 },
    ]
  },
  {
    year: 2014,
    winners: [
      { rank: 1, name: 'Hans Schmidt', score: 155 },
      { rank: 2, name: 'Maria Garcia', score: 151 },
      { rank: 3, name: 'Li Wei', score: 147 },
    ]
  },
]

const mockResults: MatchResult[] = [
  {
    id: '1',
    date: '2026-06-11',
    homeTeam: 'USA',
    awayTeam: 'Canada',
    prediction: { homeScore: 2, awayScore: 1 },
    actual: { homeScore: 2, awayScore: 1 },
    points: 3
  },
  {
    id: '2',
    date: '2026-06-12',
    homeTeam: 'Mexico',
    awayTeam: 'England',
    prediction: { homeScore: 1, awayScore: 2 },
    actual: { homeScore: 0, awayScore: 3 },
    points: 1
  },
  {
    id: '3',
    date: '2026-06-13',
    homeTeam: 'Brazil',
    awayTeam: 'Germany',
    prediction: { homeScore: 2, awayScore: 2 },
    actual: { homeScore: 3, awayScore: 1 },
    points: 0
  },
]

// Define the props interface
interface CircularTabProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

// Circular Tab Component
const CircularTab: React.FC<CircularTabProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted-foreground/10'
    }`}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
)

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState('')
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)
  const [currentUser, setCurrentUser] = useState({ name: 'John Doe', rank: 7 })
  const [receiveEmails, setReceiveEmails] = useState(true)
  const [results, setResults] = useState<MatchResult[]>(mockResults)
  const [leaderboard, setLeaderboard] = useState<Player[]>(mockLeaderboard)
  const [pastTournaments, setPastTournaments] = useState<TournamentTopThree[]>(mockPastTournaments)
  const [activeTab, setActiveTab] = useState('leaderboard')

  useEffect(() => {
    const targetDate = new Date('2026-06-11T00:00:00')
    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    try {
      const response = await axios.get(`${API_URL}/manager/all-summaries`)
      const summariesData = response.data.summaries || []
      setSummaries(summariesData)
      // Set the most recent summary as default
      const mostRecentSummary = summariesData.reduce((a: Summary, b: Summary) => 
        new Date(a.date) > new Date(b.date) ? a : b, {} as Summary)
      setSelectedSummary(mostRecentSummary || null)
    } catch (error) {
      console.error('Error fetching summaries:', error)
    }
  }

  const handleDateChange = (date: string) => {
    const summary = summaries.find((s) => s.date === date) || null
    setSelectedSummary(summary)
  }

  const getPointsColor = (points: number) => {
    if (points === 3) return 'text-green-500'
    if (points === 0) return 'text-red-500'
    return 'text-yellow-500'
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((player) => (
                    <TableRow key={player.rank} className={player.name === currentUser.name ? "bg-muted" : ""}>
                      <TableCell className="font-medium">{player.rank}</TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell className="text-right">{player.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      case 'results':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Your Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Your Prediction</TableHead>
                    <TableHead>Actual Result</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.date}</TableCell>
                      <TableCell>{result.homeTeam} vs {result.awayTeam}</TableCell>
                      <TableCell>{result.prediction.homeScore} - {result.prediction.awayScore}</TableCell>
                      <TableCell>{result.actual.homeScore} - {result.actual.awayScore}</TableCell>
                      <TableCell className={getPointsColor(result.points)}>
                        {result.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      case 'summaries':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Daily Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleDateChange} defaultValue={selectedSummary?.date}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {summaries.map((summary) => (
                    <SelectItem key={summary.date} value={summary.date}>{summary.date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">{selectedSummary?.content || "No summary available for this date."}</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'nostalgia':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Nostalgia - Past Tournament Top 3</CardTitle>
            </CardHeader>
            <CardContent>
              {pastTournaments.map((tournament) => (
                <div key={tournament.year} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{tournament.year} World Cup</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournament.winners.map((winner) => (
                        <TableRow key={`${tournament.year}-${winner.rank}`}>
                          <TableCell className="font-medium">{winner.rank}</TableCell>
                          <TableCell>{winner.name}</TableCell>
                          <TableCell className="text-right">{winner.score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      case 'rules':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Competition Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Predictions must be submitted before the deadline for each match.</li>
                <li>Points are awarded based on the accuracy of your predictions.</li>
                <li>Tiebreakers will be resolved based on the earliest submission time.</li>
                <li>The leaderboard is updated after each match day.</li>
                <li>Any attempts to manipulate the system will result in disqualification.</li>
              </ul>
            </CardContent>
          </Card>
        )
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="receive-emails" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Receive Email Notifications</span>
                </Label>
                <Switch
                  id="receive-emails"
                  checked={receiveEmails}
                  onCheckedChange={setReceiveEmails}
                />
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">World Cup 2026 Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Left</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeLeft}</div>
            <p className="text-xs text-muted-foreground">Until predictions close</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm  font-medium">Your Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser.rank}</div>
            <p className="text-xs text-muted-foreground">Out of all participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Player</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderboard[0].name}</div>
            <p className="text-xs text-muted-foreground">{leaderboard[0].score} points</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-center items-center space-x-4">
          <CircularTab
            icon={<BarChart className="h-6 w-6" />}
            label="Leaderboard"
            isActive={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
          />
          <CircularTab
            icon={<Trophy className="h-6 w-6" />}
            label="Results"
            isActive={activeTab === 'results'}
            onClick={() => setActiveTab('results')}
          />
          <CircularTab
            icon={<Calendar className="h-6 w-6" />}
            label="Summaries"
            isActive={activeTab === 'summaries'}
            onClick={() => setActiveTab('summaries')}
          />
          <CircularTab
            icon={<Award className="h-6 w-6" />}
            label="Nostalgia"
            isActive={activeTab === 'nostalgia'}
            onClick={() => setActiveTab('nostalgia')}
          />
          <CircularTab
            icon={<BookOpen className="h-6 w-6" />}
            label="Rules"
            isActive={activeTab === 'rules'}
            onClick={() => setActiveTab('rules')}
          />
          <CircularTab
            icon={<Cog className="h-6 w-6" />}
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>
      </div>

      {renderContent()}
    </div>
  )
}