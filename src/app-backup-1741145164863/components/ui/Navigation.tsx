// src/components/ui/Navigation.tsx
'use client';

import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/context/Theme';
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

export default function Navbar({ navItems, vercelLogin = false}: NavbarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme(); // Use the useTheme hook correctly
    
    let activeItem = navItems.find(item => item.link === pathname);
    if (!activeItem) {
        activeItem = navItems.find(item => item.link === '/');
    }

    // No need to redefine toggleTheme - we get it from the hook

    return (
        <nav className="sticky top-0 z-50 w-full bg-navbackground">
            <div className="max-w-screen-2xl mx-auto">
                <ul className="flex h-12 items-center relative">
                    <li className="border-r border-greytext">
                        <Link href="https://www.patreon.com/ban_community">
                            <Image src="/img/misc/patreon.png" alt="Patreon" width={48} height={48} />
                        </Link>
                    </li>

                    {!vercelLogin && (
                        <li className="border-r border-greytext">
                            <Link href="/discord">
                                <Image src="/img/misc/discord.png" alt="Discord" width={48} height={48} />
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