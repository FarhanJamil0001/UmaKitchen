"use client";

import { ReactNode } from "react";
import OrderNavbar from "./order-navbar";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function OrderPageWrapper({ children, className = "" }: Props) {
  return (
    <div className={`bg-[#faf7f2] min-h-screen ${className}`}>
      <OrderNavbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}