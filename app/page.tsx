'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className='min-h-screen bg-[#0e0d0c]'>
      {/* Navigation */}
      <nav className='fixed top-0 w-full h-[76px] bg-[#0e0d0c] z-50'>
        <div className='max-w-7xl mx-auto h-10 mt-[18px] px-4 flex items-center justify-between'>
          <div className='text-2xl font-normal text-stone-50 sm:text-3xl'>
            Mike
          </div>

          {/* Desktop Navigation */}
          <div className='hidden items-center space-x-8 lg:flex'>
            <div className='relative group'>
              <button className='flex items-center text-sm font-medium text-stone-50'>
                Products
                <svg
                  className='ml-1 w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
              {/* Products Dropdown - Show on hover */}
              <div className='absolute left-0 mt-2 w-48 bg-[#1f1d1a] rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200'>
                <a
                  href='#'
                  className='block px-4 py-2 text-sm text-stone-50 hover:bg-[#34322d]'
                >
                  Assistant
                </a>
                <a
                  href='#'
                  className='block px-4 py-2 text-sm text-stone-50 hover:bg-[#34322d]'
                >
                  Knowledge
                </a>
                <a
                  href='#'
                  className='block px-4 py-2 text-sm text-stone-50 hover:bg-[#34322d]'
                >
                  Vault
                </a>
                <a
                  href='#'
                  className='block px-4 py-2 text-sm text-stone-50 hover:bg-[#34322d]'
                >
                  Workflows
                </a>
              </div>
            </div>
            <a
              href='#'
              className='text-sm font-medium transition-colors text-stone-50 hover:text-stone-300'
            >
              Customers
            </a>
            <a
              href='#'
              className='text-sm font-medium transition-colors text-stone-50 hover:text-stone-300'
            >
              Security
            </a>
            <a
              href='#'
              className='text-sm font-medium transition-colors text-stone-50 hover:text-stone-300'
            >
              News
            </a>
            <a
              href='#'
              className='text-sm font-medium transition-colors text-stone-50 hover:text-stone-300'
            >
              Company
            </a>
          </div>

          {/* Hamburger Menu Button */}
          <button
            className='z-50 p-2 lg:hidden text-stone-50'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label='Menu'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>

          {/* Auth Buttons */}
          <div className='hidden items-center space-x-4 lg:flex'>
            <button className='text-sm font-medium transition-colors text-stone-50 hover:text-stone-300'>
              Login
            </button>
            <button className='bg-stone-50 text-[#0e0d0c] px-4 py-2 rounded text-sm font-medium hover:bg-stone-200 transition-colors'>
              Contact Us
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-[#0e0d0c] z-40 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } lg:hidden`}
        >
          <div className='flex flex-col px-6 pt-24 h-full'>
            <div className='space-y-8'>
              <a
                href='#'
                className='block text-2xl font-normal text-stone-50 hover:text-stone-300'
              >
                Products
              </a>
              <a
                href='#'
                className='block text-2xl font-normal text-stone-50 hover:text-stone-300'
              >
                Customers
              </a>
              <a
                href='#'
                className='block text-2xl font-normal text-stone-50 hover:text-stone-300'
              >
                Security
              </a>
              <a
                href='#'
                className='block text-2xl font-normal text-stone-50 hover:text-stone-300'
              >
                News
              </a>
              <a
                href='#'
                className='block text-2xl font-normal text-stone-50 hover:text-stone-300'
              >
                Company
              </a>
            </div>

            <div className='pb-8 mt-auto space-y-6'>
              <a
                href='#'
                className='block text-xl font-normal text-stone-50 hover:text-stone-300'
              >
                Login
              </a>
              <a
                href='#'
                className='inline-block px-6 py-3 bg-stone-50 text-[#0e0d0c] rounded text-xl font-normal'
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='pt-[76px] px-4 sm:px-8 md:px-20'>
        <div className='pt-16 pb-12 mx-auto max-w-7xl text-center sm:pt-24 md:pt-32 sm:pb-16'>
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-[76px] text-stone-50 font-normal leading-tight mb-6 sm:mb-8'>
            (un)Professional
            <br />
            Agent
          </h1>
          <p className='text-base sm:text-lg md:text-xl text-stone-50 max-w-[280px] sm:max-w-lg mx-auto mb-8 sm:mb-12'>
            AI Legal Agent for Lawyers, companies, and citizens.
          </p>
          <button className='bg-stone-50 text-[#0e0d0c] px-5 sm:px-6 py-2.5 sm:py-3 rounded font-medium text-sm sm:text-base'>
            Join Waitlist
          </button>
        </div>

        {/* Hero Image */}
        <div className='relative w-full aspect-[16/9] max-w-6xl mx-auto mb-20 sm:mb-32'>
          <div className='overflow-hidden absolute inset-0 bg-black rounded-lg brightness-75'>
            {/* Replace with actual image */}
            <Image
              src='/hero.webp'
              alt='Hero Image'
              fill
              priority
              className='object-cover brightness-75'
            />
            <div className='w-full h-full bg-gradient-to-b from-transparent to-black' />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className='w-full bg-[#0e0d0c] px-4 sm:px-8 md:px-20'>
        <div className='mx-auto max-w-7xl'>
          <h2 className='mb-12 text-3xl font-normal text-center sm:text-4xl text-stone-50 sm:mb-16'>
            Built for Real and Cybernetic Worlds
          </h2>

          {/* Logo Container */}
          <div className='relative'>
            {/* Gradient Overlays */}
            <div className='absolute left-0 top-0 w-36 h-full bg-gradient-to-r from-[#0e0d0c] to-transparent z-10' />
            <div className='absolute right-0 top-0 w-36 h-full bg-gradient-to-l from-[#0e0d0c] to-transparent z-10' />

            {/* Scrolling Logo Container */}
            <div className='overflow-hidden relative'>
              <div className='flex items-center py-8 space-x-12 animate-scroll'>
                {/* Logo Grid - will auto scroll on mobile, static on desktop */}
                <div className='flex flex-nowrap items-center space-x-12 min-w-max opacity-60'>
                  {/* Placeholder logos */}
                  <div className='flex justify-center items-center w-24 h-20 bg-gray-800 rounded'>
                    <Image
                      src='/metalex.svg'
                      alt='Metalex'
                      height={80}
                      width={80}
                    />
                  </div>
                  <div className='flex justify-center items-center w-24 h-20 bg-gray-800 rounded'>
                    <Image
                      src='/logo-mantle-network.svg'
                      alt='Mantle Network'
                      height={80}
                      width={80}
                    />
                  </div>
                  <div className='flex justify-center items-center w-24 h-20 rounded'>
                    <Image
                      src='/safe-logo.png'
                      alt='Safe Logo'
                      height={80}
                      width={80}
                    />
                  </div>
                  {/* Add more placeholder logos as needed */}
                </div>

                {/* Duplicate set for infinite scroll effect */}
                <div className='flex flex-nowrap items-center space-x-12 min-w-max opacity-60'>
                  {/* Duplicate placeholder logos */}
                  <div className='flex justify-center items-center w-24 rounded h-20s'>
                    <Image
                      src='/metalex.svg'
                      alt='Metalex'
                      height={80}
                      width={80}
                    />
                  </div>
                  <div className='flex justify-center items-center w-24 h-20 rounded'>
                    <Image
                      src='/logo-mantle-network.svg'
                      alt='Mantle Network'
                      height={80}
                      width={80}
                    />
                  </div>
                  <div className='flex justify-center items-center w-24 h-20 rounded'>
                    <Image
                      src='/safe-logo.png'
                      alt='Safe Logo'
                      height={80}
                      width={80}
                    />
                  </div>
                  {/* Add more placeholder logos as needed */}
                </div>
              </div>
            </div>
          </div>

          {/* "See Customers" Link */}
          {/* <div className='mt-8 mb-16 text-center'>
            <a
              href='#'
              className='inline-flex items-center text-[#8e8b85] hover:text-stone-50 transition-colors text-base font-medium'
            >
              See Customers
              <svg
                className='ml-2 w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </a>
          </div> */}
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className='px-4 py-24 w-full sm:px-8 md:px-20'>
        <div className='mx-auto max-w-7xl'>
          <h2 className='mb-8 text-3xl font-normal text-center sm:text-4xl text-stone-50'>
            Augment All of Your Work on
            <br />
            One Integrated, Secure Platform
          </h2>

          <div className='flex flex-col gap-6 mt-16'>
            {/* Assistant Card */}
            <div className='grid grid-cols-1 lg:grid-cols-2'>
              {/* Left side - Assistant UI */}
              <div className='bg-[#e4e0dd] rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none overflow-hidden'>
                <div className='aspect-square lg:aspect-auto lg:h-[568px] p-8 flex items-center justify-center'>
                  {/* Assistant UI mockup */}
                  <div className='p-6 w-full max-w-md bg-white rounded-lg shadow-lg'>
                    <div className='mb-4'>
                      <p className='text-gray-700'>Summarize th</p>
                    </div>
                    <div className='flex gap-2 items-center p-2 mb-4 rounded border'>
                      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
                        <path
                          d='M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                          stroke='currentColor'
                          strokeWidth='2'
                        />
                      </svg>
                      <span className='text-gray-700'>
                        Merger Agreement.docx
                      </span>
                    </div>
                    <button className='py-2 w-full text-white bg-black rounded'>
                      Ask Mike
                    </button>
                  </div>
                </div>
              </div>
              {/* Right side - Content */}
              <div className='bg-[#151515] rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none'>
                <div className='aspect-square lg:aspect-auto lg:h-[568px] p-12 flex flex-col'>
                  <span className='mb-8 text-xl text-stone-50'>Assistant</span>
                  <div className='my-auto'>
                    <h3 className='mb-6 text-4xl font-normal sm:text-5xl text-stone-50'>
                      Tailored to
                      <br />
                      Your Expertise
                    </h3>
                    <p className='mb-8 text-base text-stone-50 sm:text-lg'>
                      Delegate complex tasks in natural language to your
                      domain-specific personal assistant.
                    </p>
                    <a
                      href='#'
                      className='inline-flex items-center text-[#8e8b85] hover:text-stone-50 transition-colors text-base font-medium'
                    >
                      Explore Assistant
                      <svg
                        className='ml-2 w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Card */}
            <div className='grid grid-cols-1 lg:grid-cols-2'>
              {/* Left side - Content */}
              <div className='bg-[#151515] rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none'>
                <div className='aspect-square lg:aspect-auto lg:h-[568px] p-12 flex flex-col'>
                  <span className='mb-8 text-xl text-stone-50'>Knowledge</span>
                  <div className='my-auto'>
                    <h3 className='mb-6 text-4xl font-normal sm:text-5xl text-stone-50'>
                      Rapid Research,
                      <br />
                      Grounded Results
                    </h3>
                    <p className='mb-8 text-base text-stone-50 sm:text-lg'>
                      Get answers to complex research questions across multiple
                      domains in legal, regulatory, and tax with accurate
                      citations.
                    </p>
                    <a
                      href='#'
                      className='inline-flex items-center text-[#8e8b85] hover:text-stone-50 transition-colors text-base font-medium'
                    >
                      Explore Knowledge
                      <svg
                        className='ml-2 w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              {/* Right side - Knowledge UI */}
              <div className='bg-[#e4e0dd] rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none overflow-hidden'>
                <div className='aspect-square lg:aspect-auto lg:h-[568px] p-8 flex items-center justify-center'>
                  <div className='p-6 w-full max-w-md bg-white rounded-lg shadow-lg'>
                    <div className='mb-4 text-sm text-gray-400'>EUR-Lex</div>
                    <div className='p-4 w-full bg-gray-100 rounded-lg'>
                      <p className='text-gray-700'>Your Firm&apos;s Data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vault Card */}
            <div className='grid grid-cols-1 lg:grid-cols-2'>
              {/* Left side - Vault UI */}
              <div className='bg-[#e4e0dd] rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none overflow-hidden'>
                <div className='aspect-square lg:aspect-auto lg:h-[568px] p-8 flex items-center justify-center'>
                  {/* Vault UI mockup */}
                  <div className='p-6 w-full max-w-md bg-white rounded-lg shadow-lg'>
                    <div className='mb-4'>
                      <p className='text-gray-700'>Upload your documents</p>
                    </div>
                    <div className='p-4 w-full bg-gray-100 rounded-lg'>
                      <p className='text-gray-700'>No file selected</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right side - Content */}
              <div className='bg-[#151515] rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none'>
                <div className='aspect-square lg:aspect-auto lg:h-[568px] p-12 flex flex-col'>
                  <span className='mb-8 text-xl text-stone-50'>Vault</span>
                  <div className='my-auto'>
                    <h3 className='mb-6 text-4xl font-normal sm:text-5xl text-stone-50'>
                      Secure Project
                      <br />
                      Workspaces
                    </h3>
                    <p className='mb-8 text-base text-stone-50 sm:text-lg'>
                      Upload, store, and analyze thousands of documents using
                      powerful generative AI.
                    </p>
                    <a
                      href='#'
                      className='inline-flex items-center text-[#8e8b85] hover:text-stone-50 transition-colors text-base font-medium'
                    >
                      Explore Vault
                      <svg
                        className='ml-2 w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='w-full px-4 sm:px-8 md:px-20 py-24 pb-52 bg-[#0e0d0c]'>
        <div className='mx-auto max-w-7xl'>
          <h2 className='mb-16 text-3xl font-normal text-center sm:text-4xl text-stone-50'>
            Unlock Professional
            <br />
            Class AI For Your Firm
          </h2>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0'>
            {/* Enterprise Security Column */}
            <div className='relative px-6 md:px-12'>
              {/* Vertical Divider */}
              <div className='hidden md:block absolute right-0 top-0 w-px h-full bg-[#34322d]' />

              {/* Icon */}
              <div className='mb-8 w-9 h-9'>
                <svg
                  viewBox='0 0 36 36'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M30 12H6a2 2 0 00-2 2v16a2 2 0 002 2h24a2 2 0 002-2V14a2 2 0 00-2-2zM18 4l8 8H10l8-8z'
                    stroke='currentColor'
                    strokeWidth='2'
                    className='text-stone-50'
                  />
                </svg>
              </div>

              {/* Content */}
              <h3 className='mb-4 text-xl font-medium text-stone-50'>
                Enterprise-Grade Security
              </h3>
              <p className='text-base text-stone-50'>
                Robust, industry-standard protection with zero training on your
                data.
              </p>
            </div>

            {/* Prompt Libraries Column */}
            <div className='relative px-6 md:px-12'>
              {/* Vertical Divider */}
              <div className='hidden md:block absolute right-0 top-0 w-px h-full bg-[#34322d]' />

              {/* Icon */}
              <div className='mb-8 w-9 h-9'>
                <svg
                  viewBox='0 0 36 36'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M26 4H10a2 2 0 00-2 2v24a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM12 12h12M12 18h12M12 24h8'
                    stroke='currentColor'
                    strokeWidth='2'
                    className='text-stone-50'
                  />
                </svg>
              </div>

              {/* Content */}
              <h3 className='mb-4 text-xl font-medium text-stone-50'>
                Prompt Libraries
              </h3>
              <p className='text-base text-stone-50'>
                A collection of expertly-curated prompts and examples at your
                fingertips.
              </p>
            </div>

            {/* Domain Models Column */}
            <div className='px-6 md:px-12'>
              {/* Icon */}
              <div className='mb-8 w-9 h-9'>
                <svg
                  viewBox='0 0 36 36'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M18 4l14 8v12l-14 8-14-8V12l14-8zM18 18l14-8M18 18v12M18 18L4 10'
                    stroke='currentColor'
                    strokeWidth='2'
                    className='text-stone-50'
                  />
                </svg>
              </div>

              {/* Content */}
              <h3 className='mb-4 text-xl font-medium text-stone-50'>
                Domain-Specific Models
              </h3>
              <p className='text-base text-stone-50'>
                High-performing custom models built for complex professional
                work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className='w-full px-4 sm:px-8 md:px-20 py-24 bg-[#cdd8da]'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24'>
            {/* Left side - Image */}
            <div className='relative aspect-square lg:h-[560px] bg-[#34322d] rounded-lg overflow-hidden'>
              <Image
                src='/path-to-image.jpg'
                alt='Professional in discussion'
                className='object-cover'
                fill
                sizes='(max-width: 768px) 100vw, 50vw'
                priority
              />
            </div>

            {/* Right side - Quote */}
            <div className='flex flex-col justify-center'>
              <blockquote className='relative'>
                <h2 className='text-3xl sm:text-4xl text-[#0e0d0c] font-normal mb-8'>
                  &ldquo;We want to free the lawyer from mundane, routine tasks,
                  so that they can focus on what matters — strategy, advice, and
                  judgment. This has become the mantra for my team.&rdquo;
                </h2>
                <footer className='mt-4'>
                  <div className='text-base font-medium text-[#0e0d0c]'>
                    David Wakeling
                  </div>
                  <div className='text-base text-[#1f1d1a]'>
                    Global Head of Markets Innovation Group (MIG) and AI
                    <br />
                    Advisory Practice, A&O Shearman
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className='w-full px-4 sm:px-8 md:px-20 py-24 bg-[#151515] relative'>
        <div className='flex flex-col justify-between items-center mx-auto max-w-7xl md:flex-row'>
          <h2 className='mb-6 text-3xl font-normal sm:text-4xl text-stone-50 md:mb-0'>
            Unlock professional class AI for your firm
          </h2>
          <button className='bg-stone-50 text-[#151515] px-5 py-3 rounded font-medium'>
            Contact Us
          </button>
        </div>

        {/* Border that spans full width */}
        <div className='absolute bottom-0 left-0 right-0 border-t border-[#232323]' />
      </section>

      {/* Footer */}
      <footer className='relative bg-[#151515]'>
        {/* Main Footer */}
        <div className='px-4 py-16 w-full sm:px-8 md:px-20'>
          <div className='mx-auto max-w-7xl'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-6'>
              {/* Logo and Copyright */}
              <div className='md:col-span-2'>
                <div className='mb-16'>
                  <div className='mb-8 text-2xl font-normal text-stone-50 sm:text-3xl'>
                    :Mike:
                  </div>
                  {/* Social Icons */}
                  <div className='flex gap-4'>
                    {/* Twitter */}
                    <a
                      href='https://x.com/mustfollowmike'
                      className='w-12 h-12 rounded-full bg-[#232323] flex items-center justify-center hover:bg-stone-50 hover:text-[#1f1d1a] transition-colors text-stone-50'
                    >
                      <svg
                        className='w-5 h-5'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                      </svg>
                    </a>

                    {/* Telegram */}
                    <a
                      href='#'
                      className='w-12 h-12 rounded-full bg-[#232323] flex items-center justify-center hover:bg-stone-50 hover:text-[#1f1d1a] transition-colors text-stone-50'
                    >
                      <svg
                        className='w-5 h-5'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.67 2.95-1.26 3.56-1.48 3.96-1.48.09 0 .28.02.41.09.11.06.19.14.22.24.03.11.04.21.02.32z' />
                      </svg>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href='#'
                      className='w-12 h-12 rounded-full bg-[#232323] flex items-center justify-center hover:bg-stone-50 hover:text-[#1f1d1a] transition-colors text-stone-50'
                    >
                      <svg
                        className='w-5 h-5'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z' />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className='text-[#706d66] text-sm'>
                  Copyright © 2024 Counsel AI Corporation.
                  <br />
                  All rights reserved.
                </div>
              </div>

              {/* Products Column */}
              <div className='md:col-span-1'>
                <h3 className='text-sm text-[#8e8b85] font-medium mb-4'>
                  Products
                </h3>
                <ul className='space-y-3'>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Assistant
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Vault
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Knowledge
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Workflows
                    </a>
                  </li>
                </ul>
              </div>

              {/* About Column */}
              <div className='md:col-span-1'>
                <h3 className='text-sm text-[#8e8b85] font-medium mb-4'>
                  About
                </h3>
                <ul className='space-y-3'>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Customers
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Security
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Company
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      News
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Careers
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className='md:col-span-1'>
                <h3 className='text-sm text-[#8e8b85] font-medium mb-4'>
                  Resources
                </h3>
                <ul className='space-y-3'>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Legal
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      Press Kit
                    </a>
                  </li>
                </ul>
              </div>

              {/* Follow Column */}
              <div className='md:col-span-1'>
                <h3 className='text-sm text-[#8e8b85] font-medium mb-4'>
                  Follow
                </h3>
                <ul className='space-y-3'>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href='#'
                      className='text-sm text-stone-50 hover:text-stone-300'
                    >
                      𝕏
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border and Content */}
        <div className='relative'>
          {/* Bottom Border - Full Width */}
          <div className='absolute inset-x-0 border-t border-[#232323]' />

          {/* Bottom Content - Contained */}
          <div className='max-w-7xl mx-auto px-4 sm:px-8 md:px-20 py-8 flex flex-col md:flex-row justify-between items-center text-[14px] font-light text-[#888888]'>
            <div>Welcome to the Next Legal Frontier.</div>
            <div className='flex gap-8 mt-4 md:mt-0'>
              <a href='#' className='transition-colors hover:text-stone-50'>
                Privacy Policy
              </a>
              <a href='#' className='transition-colors hover:text-stone-50'>
                Terms of Using
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
