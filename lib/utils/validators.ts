import { z } from "zod";

// User signup schema
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
  aadharNumber: z
    .string()
    .length(12, "Aadhar number must be exactly 12 digits")
    .regex(/^\d+$/, "Aadhar number must only contain digits"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Admin login schema (same as user but with role validation in API)
export const adminLoginSchema = loginSchema;

// Voter registration schema
export const voterRegistrationSchema = z.object({
  aadharNumber: z
    .string()
    .length(12, "Aadhar number must be exactly 12 digits")
    .regex(/^\d+$/, "Aadhar number must only contain digits"),
  accountAddress: z.string().min(1, "Account address is required"),
});

// Add candidate schema
export const addCandidateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  party: z.string().min(1, "Party is required"),
  age: z.number().int().min(25, "Age must be at least 25 years"),
  qualification: z.string().min(1, "Qualification is required"),
});

// Voting schema
export const voteSchema = z.object({
  candidateId: z.number().int(),
});

// Election settings schema
export const electionSettingsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
  resultsVisible: z.boolean(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});