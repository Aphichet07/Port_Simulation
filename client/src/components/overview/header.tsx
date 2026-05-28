"use client";

import React, { useState } from 'react';
import { 
  Home, Layers, ShoppingCart, History, User, Menu, X, Bot,
  TrendingUp, RefreshCcw, Cpu, Zap, ShieldCheck, Trash2, Save, Plus
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NavItem = ({ label, icon, active, onClick, href }: { 
  label: string; 
  icon: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  href?: string;
}) => {
  const content = (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 whitespace-nowrap ${
        active ? 'bg-white text-black shadow-2xl scale-105 ring-1 ring-black/5' : 'text-white/60 hover:text-white'
      }`}
    >
      {icon}
      <span className="tracking-tight">{label}</span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

export const AppHeader = ({ setActiveTab = () => {} }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (href: string) => {
    router.push(href);
    setMenuOpen(false);
  };

  const navItems = [
    { label: 'Home',                      icon: <Home size={18}/>,         path: '/overview' },
    { label: 'My Portfolio & Allocation', icon: <Layers size={18}/>,       path: '/my-port' },
    { label: 'Simulate Portfolio',        icon: <ShoppingCart size={18}/>, path: '/simulate' },
  ];

  return (
    <>
      <header className="h-17.5 md:h-22.5 px-3 md:px-4 lg:px-8 flex items-center justify-between shrink-0 gap-2 relative z-100">
        
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-1 shrink-0">
          <Link href="/overview">
            <div className="cursor-pointer transition-transform hover:scale-110">
              <img src="picture/logo.png" alt="Logo" className="w-10 h-10 md:w-13 md:h-13"/>
            </div>
          </Link>
          <span className="text-base md:text-[18px] font-semibold tracking-tight hidden lg:inline">Portfolio Visualizer</span>
        </div>

        {/* Desktop Nav */}
        <nav className="cursor-pointer hidden lg:flex items-center bg-black p-1 rounded-[10px] border border-white/10 shadow-2xl gap-1 lg:gap-3">
          {navItems.map(item => (
            <NavItem
              key={item.path}
              label={item.label}
              icon={item.icon}
              active={pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Profile */}
          <div className="cursor-pointer hidden lg:flex items-center bg-black p-1 rounded-[10px] border border-white/10 shadow-2xl">
            <Link href="/profile">
              <div className={`flex items-center gap-2 md:gap-3 px-1.5 md:px-2 py-1 rounded-lg transition-all duration-300 ${
                pathname === '/profile' ? 'bg-white text-black shadow-2xl scale-105 ring-1 ring-black/5' : 'text-white/60 hover:text-white'
              }`}>
                <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-white/10 hover:ring-4 hover:ring-white/20 transition-all">
                  <User size={20} className="text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium leading-none mb-1 tracking-tight">Apichet Runbor</p>
                  <p className="text-[11px] tracking-tighter font-bold">Total Amount : 4,000 $</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer lg:hidden bg-black  rounded-[10px] p-2.5 text-white hover:bg-white/10 transition-all"
          >
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-17.5 left-0 right-0 z-99 bg-black border-b border-white/10 shadow-2xl px-4 py-3 flex flex-col gap-1">
          {navItems.map(item => (
            <NavItem
              key={item.path}
              label={item.label}
              icon={item.icon}
              active={pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
          <NavItem
            label="Profile"
            icon={<User size={18}/>}
            active={pathname === '/profile'}
            onClick={() => navigate('/profile')}
          />
        </div>
      )}
    </>
  );
};