import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

interface VotingCardProps {
  candidateId: number;
  name: string;
  party: string;
  age: number;
  qualification: string;
  isSelected: boolean;
  onSelect: (id: number) => void;
  disabled?: boolean;
}

export function VotingCard({
  candidateId,
  name,
  party,
  age,
  qualification,
  isSelected,
  onSelect,
  disabled = false,
}: VotingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg border p-4 shadow-sm transition-all duration-200",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
          : "bg-white hover:border-blue-200 dark:bg-black dark:border-gray-800 dark:hover:border-blue-900"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-blue-600 dark:text-blue-400">Party:</span> {party}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-blue-600 dark:text-blue-400">Age:</span> {age} years
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-blue-600 dark:text-blue-400">Qualification:</span> {qualification}
            </span>
          </div>
        </div>
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className={cn(
            isSelected 
              ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800" 
              : "border-blue-200 dark:border-blue-900"
          )}
          onClick={() => onSelect(candidateId)}
          disabled={disabled}
        >
          {isSelected ? (
            <>
              <Check className="mr-1 h-4 w-4" /> Selected
            </>
          ) : (
            "Select"
          )}
        </Button>
      </div>
    </motion.div>
  );
}