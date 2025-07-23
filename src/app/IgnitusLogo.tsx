"use client";

export default function IgnitusLogo() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="ignitus-gradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a259ff" />
                    <stop offset="1" stopColor="#00c2ff" />
                </linearGradient>
            </defs>
            <path d="M18 4C18 4 23 10 23 15C23 18.866 20.866 21 18 21C15.134 21 13 18.866 13 15C13 10 18 4 18 4Z" fill="url(#ignitus-gradient)"/>
            <path d="M18 21C20.2091 21 22 22.7909 22 25C22 27.2091 20.2091 29 18 29C15.7909 29 14 27.2091 14 25C14 22.7909 15.7909 21 18 21Z" fill="url(#ignitus-gradient)" fillOpacity="0.7"/>
            <circle cx="18" cy="33" r="2" fill="url(#ignitus-gradient)" fillOpacity="0.5"/>
        </svg>
    );
} 