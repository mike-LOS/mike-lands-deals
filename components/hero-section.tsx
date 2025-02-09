'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { PlusIcon } from './icons';
import { Button } from './ui/button';
import { SidebarUserNav } from './sidebar-user-nav';
import { AppSidebar } from './app-sidebar';
import { useSidebar } from './ui/sidebar';
import { ModelSelector } from './model-selector';
import { VisibilitySelector, VisibilityType } from './visibility-selector';
import { useAuth } from '@/app/contexts/AuthContext';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { usePrivy } from '@privy-io/react-auth';
import { ChevronDown } from 'lucide-react';

export function HeroSection({ 
  id,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  children,
}: { 
  id: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const bottomSectionRef = useRef(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const { user } = useAuth();
  const { login } = usePrivy();

  // Only log when selectedModelId changes
  useEffect(() => {
    console.log('🎨 HeroSection: Rendering with model:', selectedModelId);
  }, [selectedModelId]);

  // Memoize the animation setup
  const setupAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.kill();
    }

    if (bottomSectionRef.current) {
      animationRef.current = gsap.to(bottomSectionRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power4.out",
        immediateRender: true,
        clearProps: "all"
      });
    }
  }, []);

  // Clear animations on user change
  useEffect(() => {
    setupAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [user, setupAnimation]);

  // Set initial state only once
  useEffect(() => {
    if (bottomSectionRef.current) {
      gsap.set(bottomSectionRef.current, {
        y: 100,
        opacity: 0
      });
    }
  }, []);

  // Memoize the selectors section
  const selectorsSection = useMemo(() => {
    if (isReadonly) return null;
    
    return (
      <div className="flex gap-4">
        <ModelSelector
          selectedModelId={selectedModelId}
          className="text-xs"
        />
        <VisibilitySelector
          chatId={id}
          selectedVisibilityType={selectedVisibilityType}
        />
      </div>
    );
  }, [isReadonly, selectedModelId, id, selectedVisibilityType]);

  return (
    <div className="relative min-h-screen flex flex-col w-screen bg-[#0A050B]">
      {/* Background Starfield */}
      <div className="absolute inset-0 overflow-hidden">
   
      </div>

      {/* User Navigation */}
      <div className="absolute w-full top-6 z-40 max-[600px]:z-10">
        <div className="flex flex-row-reverse justify-between items-center mx-[5%]">
          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
               
                <SidebarUserNav 
                  selectedModelId={selectedModelId}
                  selectedVisibilityType={selectedVisibilityType}
                  chatId={id}
                  isReadonly={isReadonly}
                />
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={login}
                  className="px-4 py-2 text-sm font-medium text-black bg-white border  rounded-md hover:bg-[#ffffffea] "
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>

          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Logo and Title - Always visible */}
            <div className="flex items-center gap-2">
              <span className="text-white font-monument text-lg">Ask Mike</span>
            </div>

          </div>
        </div>
      </div>

      {/* AppSidebar at root level */}
      <AppSidebar />

      {/* Hero Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center w-full px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-white font-monument text-7xl mb-6">(un)Professional<br />Agent</h1>
          <p className="text-white/90 text-xl mb-8">
            AI Legal Agent for lawyers, companies and individuals.
          </p>
          <button
            className="px-6 py-3 text-black bg-white rounded-md hover:bg-[#ffffffea] font-medium"
          >
            Join waitlist
          </button>
        </div>
      </div>

      {/* Top Section with Crystal Ball */}
      <div className="relative pt-[64px] max-[1140px]:pt-[72px] flex flex-col items-center w-full">
        {/* Glowing Trapezoid Background */}
       

        <div className="relative w-[460px] h-[530px] max-[1140px]:w-[360px] max-[1140px]:h-[415px]">
          <div className="relative size-full">
         
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div 
        ref={bottomSectionRef}
        className="relative w-full flex-1 min-h-[460px] z-20 overflow-visible flex justify-center max-[1140px]:mt-[-64px] max-[600px]:mt-[-380px]"
        key={user?.id}
      >
        <div className="relative w-[1366px] h-[384px] mx-[5%] max-w-full max-[1140px]:h-[584px]">
          {/* Main Background Container */}
        
        

          <div className="relative z-10 flex justify-center items-center max-[1140px]:items-start size-full">
            {/* Center - Chat Window */}
            <div className="w-[95%] max-[1140px]:w-full flex items-end pt-[74px] max-[1140px]:pt-[12px] pb-[38px]">
              {children}
            </div>
          </div>
        </div>
      </div>
     
      {/* Information Section 2 */}
      <section className="cards-section relative w-full h-[200vh]">
        <div className="sticky top-0 w-full h-screen bg-[#0A050B] overflow-hidden">
        
        </div>
      </section>

      {/* Information Section 1 */}
      <div className="w-full py-48">
  
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#0A050B] py-16">
        <div className="max-w-7xl mx-auto px-8">
          {/* Logo and Slogan */}
          <div className="mb-16">
            <h2 className="text-white font-monument text-4xl mb-4">Mike AI</h2>
            <p className="text-gray-400">This is our slogan</p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 mb-16">
            <button className="p-3 bg-[#1A1A1A] rounded-full hover:bg-[#252525] transition-colors">
              <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button className="p-3 bg-[#1A1A1A] rounded-full hover:bg-[#252525] transition-colors">
              <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.05 1.577c-.393-.016-.784.08-1.117.235-.484.186-4.92 1.902-9.41 3.64-2.26.873-4.518 1.746-6.256 2.415-1.737.67-3.045 1.168-3.114 1.192-.46.16-1.082.362-1.61.984-.133.155-.267.354-.335.628s-.038.622.095.895c.265.547.714.773 1.244.976 1.76.564 3.58 1.102 5.087 1.608.556 1.96 1.09 3.927 1.618 5.89.174.394.553.54.944.544l-.002.02s.307.03.606-.042c.3-.07.677-.244 1.02-.565.377-.354 1.4-1.36 1.98-1.928l4.37 3.226.035.02s.484.34 1.192.388c.354.024.82-.044 1.22-.337.403-.294.67-.767.795-1.307.374-1.63 2.853-13.427 3.276-15.38l-.012.046c.296-1.1.187-2.108-.496-2.705-.342-.297-.736-.427-1.13-.444z"/>
              </svg>
            </button>
            <button className="p-3 bg-[#1A1A1A] rounded-full hover:bg-[#252525] transition-colors">
              <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
              </svg>
            </button>
          </div>

          {/* Footer Links Grid */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-medium mb-4">CONTACTS</h3>
              <div className="space-y-3">
                <p className="text-gray-400">hello@example.com</p>
                <p className="text-gray-400">2453 Mesa, New York, 47291</p>
                <p className="text-gray-400">+7-2789764286</p>
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">COMPANY</h3>
              <div className="space-y-3">
                <p className="text-gray-400">About</p>
                <p className="text-gray-400">Reviews</p>
                <p className="text-gray-400">Blog</p>
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">SERVICES</h3>
              <div className="space-y-3">
                <p className="text-gray-400">Crypto eEconomics</p>
                <p className="text-gray-400">Intellectual Property</p>
                <p className="text-gray-400">Tax Law</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-16 pt-8 border-t border-[#1A1A1A] flex justify-between items-center">
            <p className="text-gray-400">@2024 Copyright. All rights Reserved</p>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Using</a>
            </div>
          </div>
        </div>
      </footer>

      <DataStreamHandler id={id} />
    </div>
  );
} 