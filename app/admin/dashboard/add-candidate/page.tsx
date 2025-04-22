"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addCandidateSchema } from "@/lib/utils/validators";
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
import { ArrowLeft, UserPlus } from "lucide-react";

type FormData = z.infer<typeof addCandidateSchema>;

export default function AddCandidatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(addCandidateSchema),
    defaultValues: {
      name: "",
      party: "",
      age: 25,
      qualification: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add candidate");
      }

      toast.success("Candidate added successfully!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Add candidate error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add candidate");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => router.push("/admin/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Add Candidate</h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/30">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              <span>Add Candidate Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="party"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Party</FormLabel>
                        <FormControl>
                          <Input placeholder="Party Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="25"
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? 25 : value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input placeholder="Bachelor's Degree" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isLoading ? "Adding..." : "ADD"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}