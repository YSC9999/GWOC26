"use client";
import { create } from "zustand";

interface ToastState {
  message: string;
  type: "error" | "success";
  show: boolean;
  showToast: (message: string, type?: "error" | "success") => void;
  hideToast: () => void;
}

export const useGlobalToast = create<ToastState>((set) => ({
  message: "",
  type: "error",
  show: false,
  showToast: (message, type = "error") => set({ message, type, show: true }),
  hideToast: () => set({ show: false }),
}));
