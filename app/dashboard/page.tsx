"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Info, UserCheck, VoteIcon, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface ElectionStatus {
  isActive: boolean;
  startDate: string;
  endDate: string;
  resultsVisible: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>({
    isActive: false,
    startDate: "",
    endDate: "",
    resultsVisible: false,
  });

  useEffect(() => {
    const fetchUserAndElectionStatus = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Fetch election status
        const electionRes = await fetch("/api/election/status");
        if (electionRes.ok) {
          const electionData = await electionRes.json();
          setElectionStatus(electionData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndElectionStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name || "User"}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span>Voter Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Registration Status:</span>{" "}
                  <span className={user?.isRegistered ? "text-green-600" : "text-amber-600"}>
                    {user?.isRegistered ? "Registered" : "Not Registered"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Aadhar Number:</span>{" "}
                  <span className="font-mono">
                    {user?.aadharNumber ? 
                      `XXXX-XXXX-${user.aadharNumber.slice(-4)}` :
                      "Not Available"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Voting Status:</span>{" "}
                  <span className={user?.hasVoted ? "text-green-600" : "text-amber-600"}>
                    {user?.hasVoted ? "Vote Cast" : "Not Voted"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                <span>Voter Registration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-4">
                {user?.isRegistered 
                  ? "You are registered and ready to vote."
                  : "Complete your registration to participate in the election."}
              </p>
              <Button
                onClick={() => router.push("/dashboard/register")}
                disabled={user?.isRegistered}
                className="w-full"
              >
                {user?.isRegistered ? "Already Registered" : "Register Now"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voting Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="flex items-center gap-2">
                <VoteIcon className="h-5 w-5 text-blue-500" />
                <span>Voting Area</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {electionStatus.isActive ? (
                <>
                  <p className="mb-4 text-green-600">
                    Election is currently active!
                  </p>
                  <p className="mb-4">
                    {user?.hasVoted 
                      ? "You have already cast your vote."
                      : user?.isRegistered 
                        ? "You can now cast your vote."
                        : "Please complete registration first."}
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4 text-amber-600">
                    Election is not currently active.
                  </p>
                  <p className="mb-4">
                    {electionStatus.startDate 
                      ? `Election starts: ${formatDate(electionStatus.startDate)}`
                      : "Election dates have not been set yet."}
                  </p>
                </>
              )}
              <Button
                onClick={() => router.push("/dashboard/voting")}
                disabled={!electionStatus.isActive || !user?.isRegistered || user?.hasVoted}
                className="w-full"
              >
                Go to Voting Area
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="md:col-span-2 lg:col-span-3"
        >
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span>Election Results</span>
              </CardTitle>
              <CardDescription>
                View the current election results
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {electionStatus.resultsVisible ? (
                <>
                  <p className="mb-4 text-green-600">
                    Election results are available!
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/results")}
                    className="w-full md:w-auto"
                  >
                    View Results
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-4 text-amber-600">
                    Election results are not available yet.
                  </p>
                  <p>
                    {electionStatus.endDate 
                      ? `Results will be available after: ${formatDate(electionStatus.endDate)}`
                      : "The election end date has not been set yet."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}