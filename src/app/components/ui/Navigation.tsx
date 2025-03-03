// src/components/ui/Navigation.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

type NavItem = {
    name: string;
    short: string;
    link: string;
    active?: boolean;
    class?: string;
    function?: string;
};

type NavbarProps = {
    navItems: NavItem[];
    vercelLogin?: boolean;
    portalURL?: string;
};

export default function Navigation({ navItems, vercelLogin = false}: NavbarProps) {
    const pathname = usePathname();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    
    useEffect(() => {
        // Load theme from localStorage on component mount
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setTheme('dark');
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            setTheme('light');
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }, []);
    
    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            setTheme('light');
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    let activeItem = navItems.find(item => item.link === pathname);
    if (!activeItem) {
        activeItem = navItems.find(item => item.link === '/');
    }

    return (
        <nav className="sticky top-0 z-50 w-full bg-navbackground">
            <div className="max-w-screen-2xl mx-auto">
                <ul className="flex h-12 items-center relative">
                    <li className="border-r border-greytext">
                            <Image src="/context/icons8-magic-the-gathering-arena-100.png" alt="Patreon" width={48} height={48} />
                    </li>

                    {!vercelLogin && (
                        <li className="border-r border-greytext">
                            <Link href="/discord">
                                <Image src="/context/icons8-magic-the-gathering-arena-100.png" alt="Discord" width={48} height={48} />
                            </Link>
                        </li>
                    )}

                    {navItems.map((item, index) => (
                        <li key={index} className="border-r border-greytext h-full">
                            <Link
                                href={item.link}
                                className={`h-full flex items-center px-4 text-activetext hover:text-background ${item.active ? item.class || 'active' : ''
                                    }`}
                            >
                                <span className="hidden md:inline">{item.short} {item.name}</span>
                                <span className="md:hidden">{item.short}</span>
                            </Link>
                        </li>
                    ))}
                    
                    <li className="ml-auto h-full flex items-center px-4">
                        <label className="flex items-center justify-between w-14">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                />
                                <span
                                    className={`slider rounded-full w-3 h-3 absolute transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'transform translate-x-1 bg-navbackground' : 'bg-slider'
                                        }`}
                                    title={theme === 'dark' ? 'Nightbound' : 'Daybound'}
                                ></span>
                            </div>
                        </label>
                    </li>
                </ul>
            </div>
        </nav>
    );
}