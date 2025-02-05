"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";

type OrderingWindow = {
  id: string;
  orderingStart: string; // Coming as string from JSON
  orderingEnd: string;
  pickupDate: string;
  pickupTimes: string[];
};

export default function HeroSection() {
  const [windows, setWindows] = useState<OrderingWindow[]>([]);
  const [isOrderingOpen, setIsOrderingOpen] = useState(false);
  const [countdownText, setCountdownText] = useState("Loading...");

  // Fetch windows on mount
  useEffect(() => {
    async function fetchWindows() {
      try {
        const response = await fetch("/api/ordering-windows");
        const json = await response.json();
        if (json.success) {
          setWindows(json.data);
        } else {
          console.error("Failed to load windows:", json.error);
          setCountdownText("No windows found");
        }
      } catch (err) {
        console.error(err);
        setCountdownText("Error fetching windows");
      }
    }
    fetchWindows();
  }, []);

  function checkOrderingStatus() {
    const now = new Date();

    // Convert string => Date for each window
    const parsedWindows = windows.map((w) => ({
      ...w,
      orderingStart: new Date(w.orderingStart),
      orderingEnd: new Date(w.orderingEnd),
    }));

    // 1) Check if we're currently in an open window
    for (const slot of parsedWindows) {
      if (now >= slot.orderingStart && now < slot.orderingEnd) {
        // we're in an open slot
        const diff = slot.orderingEnd.getTime() - now.getTime();
        return {
          isOpen: true,
          countdown: `Ordering closes in ${formatTimeDiff(diff)}`,
        };
      }
    }

    // 2) If not open, find the next upcoming
    const futureSlots = parsedWindows.filter((slot) => slot.orderingStart > now);
    if (futureSlots.length > 0) {
      futureSlots.sort((a, b) => a.orderingStart.getTime() - b.orderingStart.getTime());
      const nextSlot = futureSlots[0];
      const diff = nextSlot.orderingStart.getTime() - now.getTime();
      return {
        isOpen: false,
        countdown: `Ordering opens in ${formatTimeDiff(diff)}`,
      };
    }

    // 3) No current or future windows
    return {
      isOpen: false,
      countdown: "No upcoming windows",
    };
  }

  function formatTimeDiff(ms: number) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  useEffect(() => {
    if (windows.length === 0) return;
    const interval = setInterval(() => {
      const { isOpen, countdown } = checkOrderingStatus();
      setIsOrderingOpen(isOpen);
      setCountdownText(countdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [windows]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="backdrop-blur-lg bg-white/10 dark:bg-black/10 rounded-2xl border border-white/20 shadow-xl p-8 md:p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          {/* Logo/Icon */}
          <div className="w-20 h-20 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center">
            <span className="text-3xl">🏡</span>
          </div>
          
          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              UMA Kitchen
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              Homemade meals from our kitchen to yours
            </p>
          </div>

          {/* Order Button & Status */}
          <div className="space-y-4">
            {isOrderingOpen ? (
              <Link href="/order">
                <Button className="bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-lg px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105">
                  Order for Pickup
                </Button>
              </Link>
            ) : (
              <Button 
                disabled 
                className="bg-white/50 text-white/70 cursor-not-allowed text-lg px-8 py-6 rounded-xl"
              >
                Order for Pickup
              </Button>
            )}
            
            {/* Countdown Display */}
            <div className="flex flex-col items-center space-y-2">
              <p className="text-white/60 text-sm uppercase tracking-wider">Next Ordering Window</p>
              <p className="text-white font-mono text-xl bg-white/10 px-4 py-2 rounded-lg">
                {countdownText}
              </p>
            </div>
          </div>

          {/* Features or Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
            {[
              { 
                icon: "🕒", 
                title: "Fresh Daily", 
                desc: "Made fresh for scheduled pickups" 
              },
              { 
                icon: "🏡", 
                title: "Local Pickup", 
                desc: "Conveniently located in your neighborhood" 
              },
              { 
                icon: "👨‍🍳", 
                title: "Home Kitchen", 
                desc: "Authentic homestyle cooking" 
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className="backdrop-blur-sm bg-white/5 rounded-xl p-4 text-center border border-white/10 transition-all duration-300 hover:bg-white/10"
              >
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}