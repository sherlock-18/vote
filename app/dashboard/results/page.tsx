"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertCircle, BarChart3, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface CandidateResult {
  id: number;
  name: string;
  party: string;
  voteCount: number;
  percentage: number;
}

interface ElectionStatus {
  isActive: boolean;
  startDate: string;
  endDate: string;
  resultsVisible: boolean;
}

export default function ResultsPage() {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus | null>(null);
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  // Fetch results and election status
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get election status
        const electionRes = await fetch("/api/election/status");
        const electionData = await electionRes.json();
        setElectionStatus(electionData);

        // Only fetch results if they're visible
        if (electionData.resultsVisible) {
          const resultsRes = await fetch("/api/election/results");
          const resultsData = await resultsRes.json();
          setResults(resultsData.candidates);
          setTotalVotes(resultsData.totalVotes);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load election results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // If results are not yet visible
  if (!electionStatus?.resultsVisible) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Election Results</h1>
        
        <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">Results Not Available</AlertTitle>
          <AlertDescription>
            The election results are not available yet. 
            {electionStatus?.endDate ? (
              <> Results will be published after the election ends at {formatDate(electionStatus.endDate)}.</>
            ) : (
              " Please check back later."
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If no votes have been cast
  if (totalVotes === 0) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Election Results</h1>
        
        <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">No Votes Cast</AlertTitle>
          <AlertDescription>
            No votes have been cast in this election yet.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Election Results</h1>
      
      <Card className="mb-8">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Results Overview</span>
          </CardTitle>
          <CardDescription>
            Total votes cast: {totalVotes}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-end mb-4 space-x-2">
            <button 
              onClick={() => setChartView("pie")}
              className={`px-3 py-1 rounded ${chartView === "pie" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
            >
              Pie Chart
            </button>
            <button 
              onClick={() => setChartView("bar")}
              className={`px-3 py-1 rounded ${chartView === "bar" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
            >
              Bar Chart
            </button>
          </div>
          
          <div className="h-[300px] mb-8">
            {chartView === "pie" ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={results}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="voteCount"
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  >
                    {results.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} votes (${props.payload.percentage.toFixed(1)}%)`, props.payload.party]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} votes (${props.payload.percentage.toFixed(1)}%)`, 
                      "Votes"
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="voteCount" 
                    name="Votes"
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Detailed Results</h3>
            {results.map((candidate, index) => (
              <motion.div 
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{candidate.name}</span>
                    <span className="text-muted-foreground ml-2">({candidate.party})</span>
                  </div>
                  <div className="text-sm font-medium">
                    {candidate.voteCount} votes ({candidate.percentage.toFixed(1)}%)
                  </div>
                </div>
                <Progress 
                  value={candidate.percentage} 
                  className="h-2"
                  indicatorClassName={`bg-[${COLORS[index % COLORS.length]}]`}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}