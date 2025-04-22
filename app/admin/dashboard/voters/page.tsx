"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertCircle, Check, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface User {
  id: number;
  name: string;
  email: string;
  aadharNumber: string;
  accountAddress?: string;
  isRegistered: boolean;
  hasVoted: boolean;
}

export default function VotersPage() {
  const [voters, setVoters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegistered, setFilterRegistered] = useState<boolean | null>(null);
  const [filterVoted, setFilterVoted] = useState<boolean | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await fetch("/api/admin/voters");
        const data = await response.json();
        setVoters(data);
      } catch (error) {
        console.error("Error fetching voters:", error);
        toast.error("Failed to load voters");
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterRegistered(null);
    setFilterVoted(null);
  };

  const filteredVoters = voters.filter((voter) => {
    // Search term filter
    const matchesSearch =
      voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.aadharNumber.includes(searchTerm);

    // Registration status filter
    const matchesRegistrationFilter =
      filterRegistered === null || voter.isRegistered === filterRegistered;

    // Voting status filter
    const matchesVotingFilter = filterVoted === null || voter.hasVoted === filterVoted;

    return matchesSearch && matchesRegistrationFilter && matchesVotingFilter;
  });

  const handleDeleteVoter = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/voters/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete voter");
      }

      setVoters(voters.filter((voter) => voter.id !== id));
      toast.success("Voter deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete voter");
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
      <h1 className="text-3xl font-bold mb-8">Voter Management</h1>
      
      <Card className="mb-6">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Registered Voters</span>
          </CardTitle>
          <CardDescription>
            View and manage all registered voters
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {voters.length === 0 ? (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No voters found</AlertTitle>
              <AlertDescription>
                There are no registered voters in the system yet.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                <div className="relative w-full md:w-auto flex-grow max-w-sm">
                  <Input
                    type="search"
                    placeholder="Search voters..."
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
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`px-3 ${filterRegistered === true ? "bg-blue-50 border-blue-200 text-blue-700" : ""}`}
                      onClick={() => setFilterRegistered(filterRegistered === true ? null : true)}
                    >
                      Registered
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`px-3 ${filterRegistered === false ? "bg-amber-50 border-amber-200 text-amber-700" : ""}`}
                      onClick={() => setFilterRegistered(filterRegistered === false ? null : false)}
                    >
                      Unregistered
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`px-3 ${filterVoted === true ? "bg-green-50 border-green-200 text-green-700" : ""}`}
                      onClick={() => setFilterVoted(filterVoted === true ? null : true)}
                    >
                      Voted
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`px-3 ${filterVoted === false ? "bg-red-50 border-red-200 text-red-700" : ""}`}
                      onClick={() => setFilterVoted(filterVoted === false ? null : false)}
                    >
                      Not Voted
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={resetFilters}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Aadhar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVoters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No voters found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVoters.map((voter) => (
                        <TableRow key={voter.id}>
                          <TableCell className="font-medium">{voter.name}</TableCell>
                          <TableCell>{voter.email}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {voter.aadharNumber.slice(0, 4)}-{voter.aadharNumber.slice(4, 8)}-{voter.aadharNumber.slice(8, 12)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1.5">
                              <Badge variant={voter.isRegistered ? "default" : "outline"} className="w-fit">
                                {voter.isRegistered ? (
                                  <Check className="mr-1 h-3 w-3 text-green-500" />
                                ) : (
                                  <X className="mr-1 h-3 w-3 text-red-500" />
                                )}
                                {voter.isRegistered ? "Registered" : "Not Registered"}
                              </Badge>
                              
                              <Badge variant={voter.hasVoted ? "default" : "outline"} className="w-fit">
                                {voter.hasVoted ? (
                                  <Check className="mr-1 h-3 w-3 text-green-500" />
                                ) : (
                                  <X className="mr-1 h-3 w-3 text-red-500" />
                                )}
                                {voter.hasVoted ? "Voted" : "Not Voted"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 border-red-200 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => setSelectedUserId(voter.id)}
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this voter and all their data. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => selectedUserId && handleDeleteVoter(selectedUserId)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4">
                Showing {filteredVoters.length} of {voters.length} voters
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}