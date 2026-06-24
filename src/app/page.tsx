"use client";

import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";

// ── Fonts ───────────────────────────────────────────
const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const pinyon = Pinyon_Script({ 
  weight: "400", 
  subsets: ["latin"] 
});

// ── Scroll-driven reveal helper ─────────────────────
// Each child in a section gets a staggered slice of the parent's scroll progress.
// As you scroll, elements animate in one-by-one.
function useStaggeredScroll(
  parentProgress: MotionValue<number>,
  index: number,
  total: number,
  options?: { startOffset?: number; overlap?: number }
) {
  const startOffset = options?.startOffset ?? 0;       // where the first item starts revealing
  const overlap = options?.overlap ?? 0.15;             // how much items overlap in their reveal
  const availableRange = 1 - startOffset;
  const sliceSize = availableRange / total;
  const start = startOffset + index * sliceSize;
  const end = Math.min(start + sliceSize + overlap, 1);

  const opacity = useTransform(parentProgress, [start, start + (end - start) * 0.4], [0, 1]);
  const y = useTransform(parentProgress, [start, end], [50, 0]);
  const x = useTransform(parentProgress, [start, end], [40, 0]);
  const xReverse = useTransform(parentProgress, [start, end], [-40, 0]);
  const scale = useTransform(parentProgress, [start, start + (end - start) * 0.6], [0.95, 1]);

  return { opacity, y, x, xReverse, scale };
}

// ───────────────────────────────────────────────────────
// ── Google Sheets Integration ───────────────────────
// Replace this URL with your deployed Google Apps Script web app URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXkhGWThVfKYQ1_Q1H897_zvjf6sS5JnlriqLo3LbxdU4-Ivg3Qe4ieW_6TEoYndya/exec";

export default function EngagementInvite() {
  const [rsvp, setRsvp] = useState<"yes" | "no" | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState("");
  const [rsvpNameError, setRsvpNameError] = useState(false);
  const [rsvpGuestsError, setRsvpGuestsError] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState(false);

  const handleRsvpAttend = (choice: "yes" | "no") => {
    if (!rsvpName.trim()) {
      setRsvpNameError(true);
      return;
    }
    setRsvpNameError(false);
    setRsvp(choice);
  };

  const handleRsvpSubmit = async () => {
    if (!rsvpName.trim()) {
      setRsvpNameError(true);
      return;
    }

    if (rsvp === "yes" && !rsvpGuests.trim()) {
      setRsvpGuestsError(true);
      return;
    }

    setRsvpLoading(true);
    setRsvpError(false);

    try {
      const payload = {
        name: rsvpName.trim(),
        attending: rsvp === "yes" ? "Yes" : "No",
        guests: rsvp === "yes" ? rsvpGuests.trim() : "0",
        timestamp: new Date().toISOString(),
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script doesn't support CORS preflight
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // no-cors means we can't read the response, but if no error was thrown the request was sent
      setRsvpSubmitted(true);
    } catch {
      setRsvpError(true);
    } finally {
      setRsvpLoading(false);
    }
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false
  });

  useEffect(() => {
    const targetDate = new Date("2026-07-19T15:30:00+05:30").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isCompleted: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── RSVP Reminder Popup ──────────────────────────────
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowReminder(true), 2000);
    const hideTimer = setTimeout(() => setShowReminder(false), 12000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // ── Section Refs ─────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const countdownRef = useRef<HTMLElement>(null);
  const inviteRef = useRef<HTMLElement>(null);
  const rsvpRef = useRef<HTMLElement>(null);

  // ── Hero: drifts up as you scroll away ───────────────
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

  // ── Countdown: scroll-driven staggered reveal ───────
  // "start end" = section top hits viewport bottom → "center center" = section center hits viewport center
  const { scrollYProgress: cdProgress } = useScroll({ target: countdownRef, offset: ["start end", "center center"] });
  // 3 items: countdown numbers, "Where is it?" heading, address + button
  const cd0 = useStaggeredScroll(cdProgress, 0, 3, { startOffset: 0.05 });
  const cd1 = useStaggeredScroll(cdProgress, 1, 3, { startOffset: 0.05 });
  const cd2 = useStaggeredScroll(cdProgress, 2, 3, { startOffset: 0.05 });

  // ── Invite: scroll-driven staggered reveal ──────────
  const { scrollYProgress: invProgress } = useScroll({ target: inviteRef, offset: ["start end", "center center"] });
  // 4 items: heading, para1, para2, para3, then image
  const inv0 = useStaggeredScroll(invProgress, 0, 5, { startOffset: 0.0 });
  const inv1 = useStaggeredScroll(invProgress, 1, 5, { startOffset: 0.0 });
  const inv2 = useStaggeredScroll(invProgress, 2, 5, { startOffset: 0.0 });
  const inv3 = useStaggeredScroll(invProgress, 3, 5, { startOffset: 0.0 });
  const inv4 = useStaggeredScroll(invProgress, 4, 5, { startOffset: 0.0 });

  // ── RSVP: scroll-driven staggered reveal ────────────
  const { scrollYProgress: rsvpProgress } = useScroll({ target: rsvpRef, offset: ["start end", "center center"] });
  const rsvp0 = useStaggeredScroll(rsvpProgress, 0, 3, { startOffset: 0.0 });
  const rsvp1 = useStaggeredScroll(rsvpProgress, 1, 3, { startOffset: 0.0 });
  const rsvp2 = useStaggeredScroll(rsvpProgress, 2, 3, { startOffset: 0.0 });

  return (
    <main className={`min-h-screen text-[#4A433E] ${cormorant.className} overflow-x-hidden selection:text-white relative`}>
      {/* Viewport meta is handled by Next.js */}
      {/* ═══ RSVP REMINDER POPUP ═══ */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 bg-[#FBF7EF] px-4 md:px-6 py-2 md:py-3 rounded-[15px] shadow-lg flex items-center gap-3 w-[calc(100%-2rem)] sm:w-auto max-w-md ${cormorant.className}`}
          >
            <span className="font-medium text-black text-center flex-1" style={{ fontSize: 'clamp(16px, 3.5vw, 22px)' }}>
              Please fill out the RSVP below!
            </span>
            <button 
              onClick={() => setShowReminder(false)}
              className="text-black/50 hover:text-black ml-2 text-xl cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ INDIAN THEMED BACKGROUNDS ═══ */}
      <img
        src="/top_bg.PNG"
        alt=""
        className="absolute top-0 left-0 w-full h-auto pointer-events-none"
      />
      <img
        src="/bottom_bg.PNG"
        alt=""
        className="absolute bottom-0 left-0 w-full h-auto pointer-events-none"
      />


      {/* ═══ SECTION 1: HERO ═══ */}
      <section ref={heroRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-24 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center w-full">
          <motion.img
            src="/ganpati.png"
            alt="ganpati"
            className="mt-4 h-14 sm:h-20 pointer-events-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center mt-4">
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} 
              className={`mb-3 sm:mb-4 ${cormorant.className} font-medium`}
              style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
            >
              With the blesses of our Families 
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} 
              className={`text-[#837834] leading-[1.0] mb-3 sm:mb-4 ${pinyon.className} relative z-20 py-2 sm:py-4 px-2`}
              style={{ fontSize: 'clamp(42px, 12vw, 96px)' }}
            >
              Chhaya <span className={`bg-clip-text mx-2 sm:mx-4 ${cormorant.className} font-light italic inline-block`} style={{ fontSize: 'clamp(24px, 6vw, 54px)' }}>&amp;</span> Dwij
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} 
              className={`mb-3 sm:mb-4 ${cormorant.className} font-medium`}
              style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
            >
              Are getting engaged On
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }} 
              className={`${cormorant.className} font-semibold`}
              style={{ fontSize: 'clamp(26px, 6vw, 35px)' }}
            >
              July 16th
            </motion.p>
          </div>
        </motion.div>
      </section>
          
      {/* ═══ SECTION 2: COUNTDOWN TIMER ═══ */}
      <section ref={countdownRef} className="relative w-full py-12 sm:py-16 md:py-24 z-10 px-4 sm:px-6 flex justify-center items-center mb-20 sm:mb-40 md:mb-100">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[420px] flex flex-col">
            <div className="pt-2 pb-8 px-4 flex flex-col items-center text-center">
              
              {/* Item 1: Countdown Numbers — fades up */}
              <motion.div style={{ opacity: cd0.opacity, y: cd0.y, scale: cd0.scale }} className="flex flex-col items-center w-full mb-16">
                <div className="flex items-center justify-between w-full max-w-[280px] sm:max-w-[320px] text-black font-normal tracking-wide font-serif" style={{ fontSize: 'clamp(28px, 7vw, 44px)' }}>
                  <span className="w-12 sm:w-16 text-center tabular-nums">{String(timeLeft.days).padStart(2, "0")}</span>
                  <span className="text-black select-none pb-2">:</span>
                  <span className="w-10 sm:w-12 text-center tabular-nums">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="text-black select-none pb-2">:</span>
                  <span className="w-10 sm:w-12 text-center tabular-nums">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="text-black select-none pb-2">:</span>
                  <span className="w-10 sm:w-12 text-center tabular-nums">{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
                <div className="flex justify-between w-full max-w-[280px] sm:max-w-[320px] font-light text-black px-1" style={{ fontSize: 'clamp(12px, 2.5vw, 15px)' }}>
                  <span className="w-12 sm:w-16 text-center">Days</span>
                  <span className="w-10 sm:w-12 text-center">Hours</span>
                  <span className="w-10 sm:w-12 text-center">Minutes</span>
                  <span className="w-10 sm:w-12 text-center">Seconds</span>
                </div>
              </motion.div>

              {/* Item 2: "Where is it?" heading — fades up */}
              <motion.div style={{ opacity: cd1.opacity, y: cd1.y, scale: cd1.scale }}>
                <h1 className={`text-black leading-[1.0] ${pinyon.className} relative z-20 px-2 mb-2`} style={{ fontSize: 'clamp(32px, 8vw, 48px)' }}>
                  Where is it?
                </h1>
              </motion.div>

              {/* Item 3: Address + Directions button — fades up */}
              <motion.div style={{ opacity: cd2.opacity, y: cd2.y, scale: cd2.scale }}>
                <p className={`${cormorant.className} font-medium`} style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}>
                  Beaumont Community Centre
                </p>
                <p className={`mb-6 sm:mb-8 ${cormorant.className} font-medium`} style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}>
                  5204 50 Ave, Beaumont, AB T4X 1E3
                </p>
                <motion.a
                  href="https://www.google.com/maps/search/?api=1&query=Beaumont+Community+Centre+5204+50+Ave+Beaumont+AB+T4X+1E3"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`block mt-6 sm:mt-10 text-center cursor-pointer bg-[#FCCBBF] ${cormorant.className} font-medium py-2 px-3 rounded-[10px] mx-6 sm:mx-20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:brightness-95 transition-all`}
                  style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
                >
                  Get Directions
                </motion.a>
              </motion.div>


              <motion.div style={{ opacity: cd1.opacity, y: cd1.y, scale: cd1.scale }}>
                <h1 className={`text-black leading-[1.0] ${pinyon.className} relative z-20 px-2 mb-2 mt-12 sm:mt-20`} style={{ fontSize: 'clamp(32px, 8vw, 48px)' }}>
                  When is it?
                </h1>
              </motion.div>

              {/* Item 3: Address + Directions button — fades up */}
              <motion.div style={{ opacity: cd2.opacity, y: cd2.y, scale: cd2.scale }} className="">
                <p className={`${cormorant.className} font-medium`} style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}>
                  From 9:00 am to 2:00 pm
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: INVITE ═══ */}
      <section ref={inviteRef} className="relative w-full py-12 sm:py-16 md:py-24 z-10 px-4 sm:px-6 flex justify-center items-center mb-20 sm:mb-40 md:mb-100">
        <div className="w-full flex justify-center">
          <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col">

            <div className="pt-2 flex flex-col items-center text-center">
              {/* Item 1: Heading — slides in from right */}
              <motion.h1 
                style={{ opacity: inv0.opacity, x: inv0.x, scale: inv0.scale, fontSize: 'clamp(32px, 8vw, 48px)' }} 
                className={`w-full text-black leading-[1.0] ${pinyon.className} relative z-20 mb-3 sm:mb-4`}
              >
                Dear friends and family!
              </motion.h1>

              {/* Item 2: Para 1 — slides in from right */}
              <motion.p 
                style={{ opacity: inv1.opacity, x: inv1.x, fontSize: 'clamp(16px, 4vw, 25px)' }} 
                className={`mb-2 ${cormorant.className} font-medium`}
              >
                We are thrilled to announce a special event happening this summer our engagement!
              </motion.p>

              {/* Item 3: Para 2 — slides in from right */}
              <motion.p 
                style={{ opacity: inv2.opacity, x: inv2.x, fontSize: 'clamp(16px, 4vw, 25px)' }} 
                className={`mb-2 ${cormorant.className} font-medium`}
              >
                This day wouldn&apos;t be complete without our closest loved ones, so we warmly invite you to join us and celebrate this joyful occasion together.
              </motion.p>

              {/* Item 4: Para 3 — slides in from right */}
              <motion.p 
                style={{ opacity: inv3.opacity, x: inv3.x, fontSize: 'clamp(16px, 4vw, 25px)' }} 
                className={`${cormorant.className} font-medium`}
              >
                We can&apos;t wait to share this memorable moment with you!
              </motion.p>
            </div>

            {/* Item 5: Image — slides in from the left */}
            <motion.div 
              style={{ opacity: inv4.opacity, x: inv4.xReverse, scale: inv4.scale }} 
              className="w-full sm:w-3/4 md:w-1/2 mx-auto flex justify-center mt-10 sm:mt-20"
            >
              <img
                src="/eng2.jpg"
                alt="Chhaya & Dwij"
                className="w-full h-auto max-h-[400px] sm:max-h-[480px] object-cover pointer-events-none rounded-sm"
              />
            </motion.div>

          </div>
        </div>
      </section>


      {/* ═══ RSVP SECTION ═══ */}
      <section ref={rsvpRef} className="relative w-full py-12 sm:py-0 md:py-100 px-4 flex justify-center mb-[45vh] sm:mb-[40vh] md:mb-[35vh]">
        <div className="w-full max-w-xl">
          {rsvpSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className={`text-black ${pinyon.className}`} style={{ fontSize: 'clamp(28px, 7vw, 35px)' }}>
                {rsvp === "yes" ? "We can\u0027t wait to see you!" : "We\u0027ll miss you! Thank you for letting us know."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Item 1: Title */}
              <motion.h1 
                style={{ opacity: rsvp0.opacity, y: rsvp0.y, scale: rsvp0.scale, fontSize: 'clamp(32px, 8vw, 48px)' }} 
                className={`text-center text-black mb-3 sm:mb-4 ${pinyon.className}`}
              >
                Be Our Guest
              </motion.h1>

              {/* Item 2: Subtitle */}
              <motion.p 
                style={{ opacity: rsvp1.opacity, y: rsvp1.y, fontSize: 'clamp(16px, 4vw, 25px)' }} 
                className={`text-center mb-6 sm:mb-10 ${cormorant.className} font-medium`}
              >
                Kindly let us know if you can join our celebration.
              </motion.p>

              {/* Item 3: Form */}
              <motion.div style={{ opacity: rsvp2.opacity, y: rsvp2.y }}>
                {/* ── Full Name ── */}
                <label className={`block pl-3 mb-2 ${cormorant.className} font-medium`} style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  value={rsvpName}
                  onChange={(e) => { setRsvpName(e.target.value); if (e.target.value.trim()) setRsvpNameError(false); }}
                  placeholder="e.g. Dwij Patel"
                  className={`w-full px-4 py-2 rounded-[10px] bg-[#FBF7EF] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:outline-none transition-all ${cormorant.className} ${rsvpNameError ? 'ring-2 ring-red-400' : ''}`}
                  style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
                />
                {rsvpNameError && (
                  <p className={`pl-3 mt-1 text-red-400 ${cormorant.className}`} style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
                    Please enter your full name to continue.
                  </p>
                )}

                {/* ── Will you attend? ── */}
                <label className={`block pl-3 mt-6 sm:mt-8 mb-2 ${cormorant.className} font-medium`} style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}>
                  Will you be attending?
                </label>
                <div className="grid grid-cols-2 gap-4 sm:gap-8">
                  <motion.button
                    id="rsvp-yes"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRsvpAttend("yes")}
                    className={`py-2 rounded-[10px] cursor-pointer transition-all duration-200 ${cormorant.className} ${
                      rsvp === "yes"
                        ? "bg-[#FCD66B] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                        : "bg-[#FBF7EF] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-[#FCD66B]/50"
                    }`}
                    style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
                  >
                    Yes
                  </motion.button>
                  <motion.button
                    id="rsvp-no"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRsvpAttend("no")}
                    className={`py-2 rounded-[10px] cursor-pointer transition-all duration-200 ${cormorant.className} ${
                      rsvp === "no"
                        ? "bg-[#FCD66B] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                        : "bg-[#FBF7EF] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-[#FCD66B]/50"
                    }`}
                    style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
                  >
                    No
                  </motion.button>
                </div>

                {/* ── If Yes: show guest count then submit ── */}
                {rsvp === "yes" && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <label className={`block pl-3 mt-6 sm:mt-8 mb-2 ${cormorant.className} font-medium`} style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}>
                      How many people will be attending? <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="rsvp-guests"
                      type="number"
                      min="1"
                      value={rsvpGuests}
                      onChange={(e) => { setRsvpGuests(e.target.value); if (e.target.value.trim()) setRsvpGuestsError(false); }}
                      placeholder="e.g. 4"
                      className={`w-full px-4 py-2 rounded-[10px] bg-[#FBF7EF] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:outline-none transition-all ${cormorant.className} ${rsvpGuestsError ? 'ring-2 ring-red-400' : ''}`}
                      style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
                    />
                    {rsvpGuestsError && (
                      <p className={`pl-3 mt-1 text-red-400 ${cormorant.className}`} style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
                        Please enter the number of guests.
                      </p>
                    )}
                    <div className="flex justify-center mt-10">
                      <motion.button
                        id="rsvp-submit-yes"
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleRsvpSubmit}
                        disabled={rsvpLoading}
                        className={`px-8 sm:px-10 py-2 rounded-[10px] bg-[#FCCBBF] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer hover:brightness-95 transition-all ${cormorant.className} ${rsvpLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
                      >
                        {rsvpLoading ? 'Sending...' : 'Confirm RSVP'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── If No: show submit immediately ── */}
                {rsvp === "no" && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex justify-center mt-10">
                    <motion.button
                      id="rsvp-submit-no"
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleRsvpSubmit}
                      disabled={rsvpLoading}
                      className={`px-8 sm:px-10 py-2 rounded-[10px] bg-[#FCCBBF] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer hover:brightness-95 transition-all ${cormorant.className} ${rsvpLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      style={{ fontSize: 'clamp(18px, 4.5vw, 25px)' }}
                    >
                      {rsvpLoading ? 'Sending...' : 'Confirm RSVP'}
                    </motion.button>
                  </motion.div>
                )}

                {rsvpError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center mt-4 text-red-400 ${cormorant.className}`}
                    style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}
                  >
                    Something went wrong. Please try again.
                  </motion.p>
                )}
              </motion.div>
            </>
          )}
        </div>
      </section>

  
    </main>
  );
}
