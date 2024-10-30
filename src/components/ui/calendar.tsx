"use client"
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  mode?: "single" | "multiple" | "range";
}

type CustomHeaderProps = {
    date: Date;
    onPreviousClick: () => void;
    onNextClick: () => void;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ date, onPreviousClick, onNextClick }) => (
  <div className="flex justify-between items-center">
    <button onClick={onPreviousClick}>
      <ChevronLeftIcon className="h-4 w-4" />
    </button>
    <span>{date.toLocaleDateString()}</span>
    <button onClick={onNextClick}>
      <ChevronRightIcon className="h-4 w-4" />
    </button>
  </div>
);
