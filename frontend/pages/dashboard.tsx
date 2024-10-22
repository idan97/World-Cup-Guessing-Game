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
  text: string;
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

const summaries: Summary[] = [
  { date: '2026-06-15', text: "Today marks a historic moment as the 2026 FIFA World Cup kicks off with a spectacular opening ceremony in Mexico City. The host nation, Mexico, will face Canada in the inaugural match at the iconic Azteca Stadium." },
  { date: '2026-06-14', text: "On the eve of the World Cup, teams are making their final preparations. Training sessions are in full swing as coaches fine-tune their strategies." },
  { date: '2026-06-13', text: "Two days before the World Cup begins, and the excitement is reaching fever pitch. Today saw a flurry of activities across the host nations." },
];

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState('');
  const [summary, setSummary] = useState(summaries[0]);
  const [selectedDate, setSelectedDate] = useState(summaries[0].date);
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

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const newSummary = summaries.find(s => s.date === date);
    if (newSummary) {
      setSummary(newSummary);
    }
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
              <Button asChild variant="outline">
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
            <CardTitle>Your Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Your Prediction</TableHead>
                  <TableHead>Actual Score</TableHead>
                  <TableHead>Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exampleMatches.map(match => (
                  <TableRow key={match.id}>
                    <TableCell>{match.team1} vs {match.team2}</TableCell>
                    <TableCell>
                      {match.userPrediction 
                        ? `${match.userPrediction.team1} - ${match.userPrediction.team2}`
                        : 'Not predicted'}
                    </TableCell>
                    <TableCell>
                      {match.actualScore 
                        ? `${match.actualScore.team1} - ${match.actualScore.team2}`
                        : 'Not played yet'}
                    </TableCell>
                    <TableCell>
                      {match.actualScore && match.userPrediction
                        ? (match.actualScore.team1 === match.userPrediction.team1 && 
                           match.actualScore.team2 === match.userPrediction.team2) ? 3 : 0
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button asChild>
                <Link href="/predictions">See All Predictions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <CardHeader>
            <CardTitle>Summary of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleDateChange} defaultValue={selectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {summaries.map(s => (
                  <SelectItem key={s.date} value={s.date}>{s.date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-4">{summary.text}</p>
            <div className="mt-4">
              <Textarea
                placeholder="Leave a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button onClick={handleCommentSubmit} className="mt-2">
                <MessageCircle className="mr-2 h-4 w-4" />
                Submit Comment
              </Button>
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
              <Button asChild variant="outline">
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
          <Button asChild variant="outline">
            <Link href="/rules">View Rules</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}