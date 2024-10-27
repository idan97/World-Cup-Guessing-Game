import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Trophy, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface TopPlayer {
  rank: number;
  name: string;
  score: number;
}

interface Match {
  id: number;
  team1: string;
  team2: string;
  date: string;
  userPrediction?: { team1: number; team2: number };
  actualScore?: { team1: number; team2: number };
}

interface Summary {
  date: string;
  content: string;
}

const topPlayers: TopPlayer[] = [
  { rank: 1, name: 'John Doe', score: 120 },
  { rank: 2, name: 'Jane Smith', score: 115 },
  { rank: 3, name: 'Bob Johnson', score: 110 },
];

const exampleMatches: Match[] = [
  { id: 1, team1: 'USA', team2: 'Canada', date: '2026-06-11', userPrediction: { team1: 2, team2: 1 } },
  { id: 2, team1: 'Mexico', team2: 'England', date: '2026-06-12', userPrediction: { team1: 0, team2: 2 } },
  { id: 3, team1: 'Brazil', team2: 'Germany', date: '2026-06-13' },
];

const API_URL = 'http://127.0.0.1:8000';

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState('');
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [currentUser, setCurrentUser] = useState({ name: 'John Doe', rank: 7 });
  const [comment, setComment] = useState('');
  const [receiveEmails, setReceiveEmails] = useState(true);

  useEffect(() => {
    const targetDate = new Date('2026-06-11T00:00:00');
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const response = await axios.get(`${API_URL}/manager/all-summaries`);
      const summariesData = response.data.summaries || [];
      setSummaries(summariesData);
      setSelectedSummary(summariesData[0] || null); // Default to first summary
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const handleDateChange = (date: string) => {
    const summary = summaries.find((s) => s.date === date) || null;
    setSelectedSummary(summary);
  };

  const handleCommentSubmit = () => {
    console.log("Comment submitted:", comment);
    setComment('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white rounded-lg shadow-lg p-4">
            <CardHeader className="p-2">
              <CardTitle className="text-lg">Time Left to Submit Predictions</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-2xl font-bold">
                  <Clock className="mr-2 h-6 w-6" />
                  {timeLeft}
                </div>
                <Button asChild>
                  <Link href="/predictions">Make Predictions</Link>
                </Button>
              </div>
              {!exampleMatches.some(match => match.userPrediction) && (
                <p className="mt-2 text-sm text-red-500">Don't forget to submit your predictions!</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-lg p-4">
            <CardHeader className="p-2">
              <CardTitle className="text-lg">Your Current Rank</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex items-center justify-center text-2xl font-bold">
                <Trophy className="mr-2 h-6 w-6" />
                {currentUser.rank}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <CardHeader>
            <CardTitle className="text-xl flex justify-between items-center">
              Top Players
              <Button asChild>
                <Link href="/leaderboard">View Full Leaderboard</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPlayers.map((player) => (
                  <TableRow key={player.rank}>
                    <TableCell>{player.rank}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <CardHeader>
            <CardTitle>Daily Summaries</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleDateChange} defaultValue={selectedSummary?.date}>
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {summaries.map((summary) => (
                  <SelectItem key={summary.date} value={summary.date}>{summary.date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
              <p className="text-lg font-medium text-gray-800">{selectedSummary?.content || "No summary available for this date."}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="receive-emails">Receive Email Notifications</Label>
              <Switch
                id="receive-emails"
                checked={receiveEmails}
                onCheckedChange={setReceiveEmails}
              />
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link href="https://chat.whatsapp.com/your-group-link" target="_blank" rel="noopener noreferrer">
                  Join WhatsApp Group
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild className="mr-4">
            <Link href="/predictions">Make Predictions</Link>
          </Button>
          <Button asChild className="outline-button">
            <Link href="/rules">View Rules</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
