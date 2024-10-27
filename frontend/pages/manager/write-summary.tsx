'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'

export default function DailySummaryPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const API_URL = 'http://127.0.0.1:8000/manager';


  useEffect(() => {
    fetchSummary(date)
  }, [date])

  const fetchSummary = async (selectedDate: Date) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/daily-summary`, {
        params: { date: format(selectedDate, 'yyyy-MM-dd') }
      })
      setSummary(response.data.summary || '')
    } catch (error) {
      console.error('Error fetching summary:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch the summary. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      toast({
        title: 'Error',
        description: 'Summary cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
  
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/daily-summary`, { // Use API_URL with /manager prefix
        date: format(date, 'yyyy-MM-dd'),
        content: summary,
      });
      toast({
        title: 'Success',
        description: 'Summary saved successfully.',
      });
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">Daily Summary</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            Select Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="summary" className="text-sm font-medium text-gray-700">
            Summary
          </label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter your daily summary here..."
            className="h-40"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Summary'}
        </Button>
      </form>
    </div>
  )
}
