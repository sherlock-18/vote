"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, Users, VoteIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Candidate {
  id: number;
  name: string;
  party: string;
  age: number;
  qualification: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [electionActive, setElectionActive] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [totalVoters, setTotalVoters] = useState(0);
  const [registeredVoters, setRegisteredVoters] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidates
        const candidatesRes = await fetch("/api/candidates");
        const candidatesData = await candidatesRes.json();
        setCandidates(candidatesData);

        // Fetch election settings
        const electionRes = await fetch("/api/election/status");
        const electionData = await electionRes.json();
        setElectionActive(electionData.isActive);
        setResultsVisible(electionData.resultsVisible);

        // Fetch voter stats
        const voterStatsRes = await fetch("/api/admin/voter-stats");
        const voterStatsData = await voterStatsRes.json();
        setTotalVoters(voterStatsData.totalVoters);
        setRegisteredVoters(voterStatsData.registeredVoters);
        setTotalVotes(voterStatsData.totalVotes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCandidate = async (id: number) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete candidate");
      }

      setCandidates(candidates.filter((candidate) => candidate.id !== id));
      toast.success("Candidate deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete candidate");
    }
  };

  const handleElectionStatusChange = async (active: boolean) => {
    try {
      const response = await fetch("/api/admin/election-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: active }),
      });

      if (!response.ok) {
        throw new Error("Failed to update election status");
      }

      setElectionActive(active);
      toast.success(`Election ${active ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update election status");
    }
  };

  const handleResultsVisibilityChange = async (visible: boolean) => {
    try {
      const response = await fetch("/api/admin/results-visibility", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resultsVisible: visible }),
      });

      if (!response.ok) {
        throw new Error("Failed to update results visibility");
      }

      setResultsVisible(visible);
      toast.success(`Results are now ${visible ? "visible" : "hidden"} to voters`);
    } catch (error) {
      console.error("Visibility update error:", error);
      toast.error("Failed to update results visibility");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Voters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Total Voters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{totalVoters}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {registeredVoters} registered ({((registeredVoters / totalVoters) * 100).toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Votes Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="flex items-center gap-2">
                <VoteIcon className="h-5 w-5 text-blue-500" />
                <span>Total Votes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{totalVotes}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Voter turnout: {((totalVotes / registeredVoters) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Election Controls Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle>Election Controls</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Activate Election</span>
                  <Switch 
                    checked={electionActive} 
                    onCheckedChange={handleElectionStatusChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Results</span>
                  <Switch 
                    checked={resultsVisible} 
                    onCheckedChange={handleResultsVisibilityChange}
                  />
                </div>
                <Button
                  onClick={() => router.push("/admin/dashboard/results")}
                  className="w-full mt-2"
                >
                  View Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Candidate Information</span>
          </CardTitle>
          <CardDescription>
            Manage election candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Input
                type="search"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Button
              onClick={() => router.push("/admin/dashboard/add-candidate")}
              className="bg-green-500 hover:bg-green-600"
            >
              Add Candidate
            </Button>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No candidates found.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates?.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.party}</TableCell>
                      <TableCell>{candidate.age}</TableCell>
                      <TableCell>{candidate.qualification}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                <span className="sr-only">View details</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Candidate Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about the candidate.
                                </DialogDescription>
                              </DialogHeader>
                              {selectedCandidate && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Name</h4>
                                    <p>{selectedCandidate.name}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Party</h4>
                                    <p>{selectedCandidate.party}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Age</h4>
                                    <p>{selectedCandidate.age} years</p>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Qualification</h4>
                                    <p>{selectedCandidate.qualification}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => router.push(`/admin/dashboard/edit-candidate/${candidate.id}`)}
                          >
                            <span className="sr-only">Edit</span>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <span className="sr-only">Delete</span>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the candidate. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteCandidate(candidate.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}