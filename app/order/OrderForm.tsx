"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js App Router
import { MenuItem as PrismaMenuItem } from "@prisma/client";
import { Button } from "@/components/ui/button";

type OrderingWindow = {
    id: string;
    orderingStart: string; // Start of the ordering window
    orderingEnd: string;   // End of the ordering window
    pickupDate: string;    // The pickup date
    pickupTimes: string[]; // Available pickup times for the day
};
type MenuItem = Omit<PrismaMenuItem, "price"> & {
    price: number; // Use number instead of Decimal
};

type Props = {
    menuItems: MenuItem[]; // Menu items passed as props
};

export default function OrderPage({ menuItems }: Props) {
    const router = useRouter();

    const [windowData, setWindowData] = useState<OrderingWindow | null>(null);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>(() => {
        const initial: { [key: string]: number } = {};
        menuItems.forEach((item) => {
            initial[item.id] = 0;
        });
        return initial;
    });

    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [notifyUpdates, setNotifyUpdates] = useState(false);
    const [pickupTime, setPickupTime] = useState("");
    const [instructions, setInstructions] = useState("");

    // Fetch the current or upcoming ordering window
    useEffect(() => {
        async function fetchActiveWindow() {
            try {
                const res = await fetch("/api/ordering-windows");
                const json = await res.json();
                if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                    const now = new Date();
                    const parsed = json.data
                        .map((w: OrderingWindow) => ({
                            ...w,
                            orderingStart: new Date(w.orderingStart),
                            orderingEnd: new Date(w.orderingEnd),
                            pickupDate: new Date(w.pickupDate),
                        }))
                        .filter((w: { orderingEnd: Date; }) => w.orderingEnd > now) // Filter out past windows
                        .sort((a: { orderingStart: { getTime: () => number; }; }, b: { orderingStart: { getTime: () => number; }; }) => a.orderingStart.getTime() - b.orderingStart.getTime());

                    if (parsed.length > 0) {
                        setWindowData(parsed[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching ordering window:", error);
            }
        }
        fetchActiveWindow();
    }, []);

    // Handle quantity changes for menu items
    const handleQuantityChange = (menuItemId: string, newValue: number) => {
        setQuantities((prev) => ({
            ...prev,
            [menuItemId]: newValue < 0 ? 0 : newValue, // Ensure no negative quantities
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!windowData) {
            alert("No ordering window available right now.");
            return;
        }
        if (!pickupTime) {
            alert("Please select a pickup time.");
            return;
        }
        if (notifyUpdates && !phoneNumber) {
            alert("Please enter your phone number if you want updates.");
            return;
        }

        const items = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

        if (items.length === 0) {
            alert("Please add at least one item to your order.");
            return;
        }

        // Construct the pickup datetime
        const pDate = new Date(windowData.pickupDate);
        let [hourStr, minuteStrWithAMPM] = pickupTime.split(":");
        const minuteStr = minuteStrWithAMPM.slice(0, 2);
        const ampm = pickupTime.slice(-2);

        let hour = parseInt(hourStr, 10);
        let minute = parseInt(minuteStr, 10);
        if (ampm.toLowerCase() === "pm" && hour < 12) hour += 12;
        if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;

        const pickupDateTime = new Date(
            pDate.getFullYear(),
            pDate.getMonth(),
            pDate.getDate(),
            hour,
            minute
        );

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName,
                    phoneNumber: phoneNumber || null,
                    notifyUpdates,
                    pickupDateTime,
                    instructions,
                    items,
                }),
            });

            const result = await response.json();
            if (result.success) {
                router.push(`/order-confirmation?orderId=${result.orderId}`);
            } else {
                alert("Error placing order: " + result.error);
            }
        } catch (err) {
            alert("Network error placing order");
        }
    };

    // Calculate totals
    const calculateTotals = () => {
        let subtotal = 0;
        Object.entries(quantities).forEach(([itemId, quantity]) => {
            const item = menuItems.find(i => i.id === itemId);
            if (item) {
                subtotal += item.price * quantity;
            }
        });
        
        const tax = subtotal * 0.0825; // 8.25% tax
        const total = subtotal + tax;
        
        return {
            subtotal,
            tax,
            total
        };
    };

    const { subtotal, tax, total } = calculateTotals();

    if (!windowData) {
        return <div>No current or upcoming ordering window available.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Menu Section */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="backdrop-blur-xl bg-orange-50/90 rounded-2xl border border-orange-300 shadow-2xl p-6">
                        <h2 className="text-2xl font-bold mb-6 text-orange-950">Menu</h2>
                        <div className="space-y-12">
                            {menuItems.length === 0 && <p className="text-orange-900">No menu items available.</p>}
                            {menuItems.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="flex items-center justify-between p-6 rounded-xl backdrop-blur-lg bg-white/95 hover:bg-orange-50/95 border border-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-xl text-orange-950">{item.name}</h3>
                                        <p className="text-orange-900 text-lg">${item.price.toFixed(2)}</p>
                                        {item.description && (
                                            <p className="text-sm text-orange-800/90 mt-2">{item.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(item.id, quantities[item.id] - 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 hover:bg-orange-200 transition-colors text-orange-950 text-xl font-semibold border border-orange-300"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-bold text-xl text-orange-950">
                                            {quantities[item.id]}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(item.id, quantities[item.id] + 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 hover:bg-orange-200 transition-colors text-orange-950 text-xl font-semibold border border-orange-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Details Section */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-orange-50/90 rounded-2xl border border-orange-300 shadow-2xl p-6 space-y-6 sticky top-24">
                        <h2 className="text-2xl font-bold mb-6 text-orange-950">Order Details</h2>
                        
                        {/* Form inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-orange-900" htmlFor="customerName">Name</label>
                                <input
                                    id="customerName"
                                    className="w-full rounded-lg border border-orange-300 p-3 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-950 placeholder-orange-300 text-lg"
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-orange-900" htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    id="phoneNumber"
                                    className="w-full rounded-lg border border-orange-300 p-3 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-950 placeholder-orange-300 text-lg"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g. 555-555-1234"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="notifyUpdates"
                                    type="checkbox"
                                    className="rounded border-orange-200 bg-white/80 text-orange-500"
                                    checked={notifyUpdates}
                                    onChange={(e) => setNotifyUpdates(e.target.checked)}
                                />
                                <label htmlFor="notifyUpdates" className="ml-2 text-sm text-orange-900">
                                    Notify me about my order
                                </label>
                            </div>
                        </div>

                        {/* Pickup Time */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-orange-900" htmlFor="pickupTime">Pickup Time</label>
                            <select
                                id="pickupTime"
                                className="w-full rounded-lg border border-orange-300 p-3 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-950 text-lg"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                required
                            >
                                <option value="">Select a Time</option>
                                {windowData?.pickupTimes.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                        {/* Special Instructions */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-orange-900" htmlFor="instructions">Special Instructions</label>
                            <textarea
                                id="instructions"
                                className="w-full rounded-lg border border-orange-300 p-3 bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-950 placeholder-orange-300 text-lg"
                                rows={3}
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                            />
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-orange-300 pt-4 space-y-3 mt-6">
                            <div className="flex justify-between text-orange-950 text-lg">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-orange-800 text-lg">
                                <span>Tax (8.25%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl pt-3 border-t border-orange-300 text-orange-950">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className={`w-full py-6 text-xl font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                                total === 0 
                                ? "bg-orange-100 text-orange-400 cursor-not-allowed border border-orange-300" 
                                : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 border border-orange-400"
                            }`}
                            disabled={total === 0}
                        >
                            {total === 0 ? "Add items to order" : "Place Order • $" + total.toFixed(2)}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}