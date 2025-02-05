"use client"
import Link from 'next/link';

export default function OrderNavbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-lg border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="text-white font-bold text-xl">
                        UMA Kitchen
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link 
                            href="/order" 
                            className="text-gray-200 hover:text-white transition-colors"
                        >
                            Order Now
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
} 