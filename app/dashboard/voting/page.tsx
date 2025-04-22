"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VotingCard } from "@/components/ui/voting-card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertCircle, Clock, VoteIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Candidate {
  id: number;
  name: string;
  party: string;
  age: number;
  qualification: string;
}

interface ElectionStatus {
  isActive: boolean;
  startDate: string;
  endDate: string;
  resultsVisible: boolean;
}

export default function VotingPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus | null>(
    null
  );

  // Fetch candidates, user status, and election status
  useEffect(() => {
    setCandidates([
      {
        id: 1,
        name: "John Smith",
        party: "Democratic Party",
        age: 45,
        qualification: "Bachelor's in Political Science",
        createdAt: new Date("2025-01-10T10:00:00Z"),
        updatedAt: new Date("2025-01-10T10:00:00Z"),
      },
      {
        id: 2,
        name: "Emma Johnson",
        party: "Republican Party",
        age: 52,
        qualification: "Master's in Public Administration",
        createdAt: new Date("2025-02-15T12:30:00Z"),
        updatedAt: new Date("2025-02-15T12:30:00Z"),
      },
      {
        id: 3,
        name: "Michael Chen",
        party: "Green Party",
        age: 38,
        qualification: "PhD in Environmental Studies",
        createdAt: new Date("2025-03-01T09:15:00Z"),
        updatedAt: new Date("2025-03-01T09:15:00Z"),
      },
      {
        id: 4,
        name: "Sarah Davis",
        party: "Libertarian Party",
        age: 29,
        qualification: "Bachelor's in Economics",
        createdAt: new Date("2025-04-05T14:20:00Z"),
        updatedAt: new Date("2025-04-05T14:20:00Z"),
      },
      {
        id: 5,
        name: "David Patel",
        party: "Independent",
        age: 60,
        qualification: "Juris Doctor (Law)",
        createdAt: new Date("2025-04-20T11:45:00Z"),
        updatedAt: new Date("2025-04-20T11:45:00Z"),
      },
    ]);
    // const fetchData = async () => {
    //   try {
    //     // Get candidates
    //     const candidatesRes = await fetch("/api/candidates");
    //     const candidatesData = await candidatesRes.json();
    //     setCandidates([]);

    //     // Get user status
    //     const userRes = await fetch("/api/auth/me");
    //     const userData = await userRes.json();
    //     setHasVoted(userData.hasVoted);
    //     setIsRegistered(userData.isRegistered);

    //     // Get election status
    //     const electionRes = await fetch("/api/election/status");
    //     const electionData = await electionRes.json();
    //     setElectionStatus(electionData);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //     toast.error("Failed to load voting information");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchData();
  }, []);

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidate(id);
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidateId: selectedCandidate }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to cast vote");
      }

      toast.success("Your vote has been cast successfully!");
      setHasVoted(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Voting error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cast vote"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Determine message based on user and election status
  const renderStatusMessage = () => {
    if (!isRegistered) {
      return (
        <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">
            Registration Required
          </AlertTitle>
          <AlertDescription>
            You need to register as a voter before you can participate in the
            election.
          </AlertDescription>
          <div className="mt-4">
            <Button
              onClick={() => router.push("/dashboard/register")}
              className="mt-2"
            >
              Register Now
            </Button>
          </div>
        </Alert>
      );
    }

    if (hasVoted) {
      return (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <VoteIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-600 dark:text-green-400">
            Vote Already Cast
          </AlertTitle>
          <AlertDescription>
            You have already cast your vote in this election. Thank you for
            participating!
          </AlertDescription>
          <div className="mt-4">
            {electionStatus?.resultsVisible ? (
              <Button
                onClick={() => router.push("/dashboard/results")}
                className="mt-2"
              >
                View Results
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-2"
              >
                Return to Dashboard
              </Button>
            )}
          </div>
        </Alert>
      );
    }

    if (!electionStatus?.isActive) {
      return (
        <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">
            Election Not Active
          </AlertTitle>
          <AlertDescription>
            The election is not currently active.
            {electionStatus?.startDate ? (
              <> Voting begins at {formatDate(electionStatus.startDate)}.</>
            ) : (
              " Please check back later."
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const canVote = isRegistered && !hasVoted && electionStatus?.isActive;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Voting Area</h1>

      {renderStatusMessage()}

      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
          <CardTitle className="flex items-center gap-2">
            <VoteIcon className="h-5 w-5 text-blue-500" />
            <span>Cast Your Vote</span>
          </CardTitle>
          <CardDescription>
            Select a candidate and submit your vote
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {candidates?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No candidates available at this time.
            </p>
          ) : (
            <div className="space-y-4">
              {(candidates || [])?.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <VotingCard
                    candidateId={candidate.id}
                    name={candidate.name}
                    party={candidate.party}
                    age={candidate.age}
                    qualification={candidate.qualification}
                    isSelected={selectedCandidate === candidate.id}
                    onSelect={handleSelectCandidate}
                    disabled={!canVote}
                  />
                </motion.div>
              ))}

              {canVote && (
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleVote}
                    disabled={isSubmitting || !selectedCandidate}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isSubmitting ? "Submitting..." : "Cast Vote"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
