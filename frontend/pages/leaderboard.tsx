import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal } from 'lucide-react'

interface LeaderboardEntry {
  place: number
  username: string
  points: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const mockLeaderboard: LeaderboardEntry[] = [
      { place: 1, username: "JohnDoe", points: 1200 },
      { place: 2, username: "JaneSmith", points: 1150 },
      { place: 3, username: "BobJohnson", points: 1100 },
      { place: 4, username: "AliceWilliams", points: 1050 },
      { place: 5, username: "CharlieBrown", points: 1000 },
      { place: 6, username: "DavidMiller", points: 950 },
      { place: 7, username: "EvaGreen", points: 900 },
      { place: 8, username: "FrankWhite", points: 850 },
      { place: 9, username: "GraceYoung", points: 800 },
      { place: 10, username: "HenryTaylor", points: 750 },
    ]

    setLeaderboard(mockLeaderboard)

    // Simulating getting the current user from localStorage
    const storedUsername = localStorage.getItem('username')
    setCurrentUser(storedUsername)
  }, [])

  const currentUserEntry = leaderboard.find(entry => entry.username === currentUser)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold text-center mb-8">Leaderboard</h1>

      {currentUserEntry && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Current Standing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold">Place: {currentUserEntry.place}</span>
              </div>
              <div className="text-2xl font-bold">Points: {currentUserEntry.points}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Place</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right w-[100px]">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.place} className={entry.username === currentUser ? "font-bold bg-gray-100" : ""}>
                  <TableCell className="font-medium">
                    {entry.place <= 3 ? (
                      <div className="flex items-center">
                        <Medal className={`mr-2 h-5 w-5 ${
                          entry.place === 1 ? "text-yellow-500" :
                          entry.place === 2 ? "text-gray-400" :
                          "text-amber-600"
                        }`} />
                        {entry.place}
                      </div>
                    ) : (
                      entry.place
                    )}
                  </TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell className="text-right">{entry.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}