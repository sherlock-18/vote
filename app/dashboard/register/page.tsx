"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { voterRegistrationSchema } from "@/lib/utils/validators";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CreditCard, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormData = z.infer<typeof voterRegistrationSchema>;

export default function VoterRegistration() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(voterRegistrationSchema),
    defaultValues: {
      aadharNumber: "",
      accountAddress: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          
          // Pre-fill Aadhar number and check registration status
          if (userData.aadharNumber) {
            form.setValue("aadharNumber", userData.aadharNumber);
          }
          
          if (userData.isRegistered) {
            setIsRegistered(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [form]);

  async function onSubmit(data: FormData) {
    if (isRegistered) {
      toast.info("You are already registered!");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/voters/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to register");
      }

      toast.success("Registration successful!");
      setIsRegistered(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to register");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-900/30">
            <CardTitle className="text-2xl">REGISTRATION</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isRegistered ? (
              <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-600 dark:text-green-400">Already Registered</AlertTitle>
                <AlertDescription>
                  You are already registered as a voter. You can proceed to the voting area when the election is active.
                </AlertDescription>
                <div className="mt-4">
                  <Button onClick={() => router.push("/dashboard")} className="mt-2">
                    Return to Dashboard
                  </Button>
                </div>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="123456789012"
                              className="pl-10"
                              {...field}
                              disabled={!!user?.aadharNumber}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Your current address"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {isLoading ? "Registering..." : "REGISTER"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}