"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BarChart3, Download, PieChart as PieChartIcon } from "lucide-react";
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

export default function AdminResultsPage() {
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

        // Admin can always see results
        const resultsRes = await fetch("/api/election/results");
        const resultsData = await resultsRes.json();
        setResults(resultsData.candidates);
        setTotalVotes(resultsData.totalVotes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load election results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleResultsVisibilityChange = async () => {
    if (!electionStatus) return;
    
    const newVisibility = !electionStatus.resultsVisible;
    
    try {
      const response = await fetch("/api/admin/results-visibility", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resultsVisible: newVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to update results visibility");
      }

      setElectionStatus({
        ...electionStatus,
        resultsVisible: newVisibility,
      });
      
      toast.success(`Results are now ${newVisibility ? 'visible' : 'hidden'} to voters`);
    } catch (error) {
      console.error("Visibility update error:", error);
      toast.error("Failed to update results visibility");
    }
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const csvContent = [
      "Candidate ID,Name,Party,Vote Count,Percentage",
      ...results.map(candidate => 
        `${candidate.id},${candidate.name},${candidate.party},${candidate.voteCount},${candidate.percentage.toFixed(2)}`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "election_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Election Results</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <Button
          onClick={handleResultsVisibilityChange}
          variant="outline"
          className={electionStatus?.resultsVisible ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"}
        >
          {electionStatus?.resultsVisible ? "Hide Results from Voters" : "Make Results Visible to Voters"}
        </Button>
        
        <Button
          onClick={exportResults}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          disabled={results.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Results
        </Button>
      </div>
      
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
          {totalVotes === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No votes have been cast yet.
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4 space-x-2">
                <button 
                  onClick={() => setChartView("pie")}
                  className={`px-3 py-1 rounded flex items-center ${chartView === "pie" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                >
                  <PieChartIcon className="h-4 w-4 mr-1" />
                  Pie Chart
                </button>
                <button 
                  onClick={() => setChartView("bar")}
                  className={`px-3 py-1 rounded flex items-center ${chartView === "bar" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Bar Chart
                </button>
              </div>
              
              <div className="h-[400px] mb-8">
                {chartView === "pie" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={results}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
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
              
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">Candidate</th>
                      <th className="text-left py-3 px-4">Party</th>
                      <th className="text-right py-3 px-4">Votes</th>
                      <th className="text-right py-3 px-4">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...results]
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((candidate, index) => (
                        <tr key={candidate.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">{candidate.name}</td>
                          <td className="py-3 px-4">{candidate.party}</td>
                          <td className="py-3 px-4 text-right">{candidate.voteCount}</td>
                          <td className="py-3 px-4 text-right">{candidate.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}