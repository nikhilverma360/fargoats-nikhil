import * as React from "react";

export type ToastActionElement = React.ReactNode;

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
}

// You can add more functionality or components related to toast here
