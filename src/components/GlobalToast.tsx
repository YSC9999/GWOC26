"use client";
import Toast from "@/components/Toast";
import { useGlobalToast } from "@/lib/global-toast";

export default function GlobalToast() {
  const { show, message, type, hideToast } = useGlobalToast();

  if (!show) return null;

  return <Toast message={message} type={type} onClose={hideToast} />;
}
