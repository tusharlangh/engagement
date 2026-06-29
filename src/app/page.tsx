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
 const startOffset = options?.startOffset ?? 0; // where the first item starts revealing
 const overlap = options?.overlap ?? 0.15; // how much items overlap in their reveal
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

const AmpersandDivider = () => (
  <div className="flex items-center justify-center opacity-100 pointer-events-none overflow-visible" style={{ minHeight: '100px' }}>
    
    <span className={`mx-2 text-[#7A2A39] ${pinyon.className} inline-block overflow-visible`} style={{ fontSize: '72px', lineHeight: '1.6', padding: '8px 24px'}}>&amp;</span>
    
  </div>
);

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

 if (rsvp === "yes" && (!rsvpGuests.trim() || parseInt(rsvpGuests, 10) <= 0)) {
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
 const targetDate = new Date("2026-07-19T09:00:00-06:00").getTime();

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
 const hideTimer = setTimeout(() => setShowReminder(false), 6000);
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
 // 3 items: heading, para1, then image
 const inv0 = useStaggeredScroll(invProgress, 0, 3, { startOffset: 0.0 });
 const inv1 = useStaggeredScroll(invProgress, 1, 3, { startOffset: 0.0 });
 const inv2 = useStaggeredScroll(invProgress, 2, 3, { startOffset: 0.0 });

 // ── RSVP: scroll-driven staggered reveal ────────────
 const { scrollYProgress: rsvpProgress } = useScroll({ target: rsvpRef, offset: ["start end", "center center"] });
 const rsvp0 = useStaggeredScroll(rsvpProgress, 0, 3, { startOffset: 0.0 });
 const rsvp1 = useStaggeredScroll(rsvpProgress, 1, 3, { startOffset: 0.0 });
 const rsvp2 = useStaggeredScroll(rsvpProgress, 2, 3, { startOffset: 0.0 });

  return (
    <div className="min-h-screen bg-[#FCE4EC] flex justify-center">
    <main 
      className={`w-full max-w-[430px] min-h-screen text-[#4A3B32] ${cormorant.className} overflow-x-hidden selection:text-white selection:bg-[#D8A4A4] relative shadow-[0_0_40px_rgba(0,0,0,0.05)]`}
      style={{ backgroundImage: 'url(/main_bg.png)', backgroundRepeat: 'repeat', backgroundSize: '280px', backgroundBlendMode: 'multiply' }}
    >
      {/* Viewport meta is handled by Next.js */}
 {/* ═══ RSVP REMINDER POPUP ═══ */}
 <AnimatePresence>
 {showReminder && (
 <motion.div
 initial={{ opacity: 0, y: -50 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -50 }}
 transition={{ duration: 0.5, ease: "easeOut" }}
  className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#D8A4A4] py-2 rounded-[15px] shadow-sm flex justify-center items-center w-[calc(100%-2rem)] max-w-[360px] ${cormorant.className}`}
  >
  <span className="font-medium text-[#8C3F4D] text-center" style={{ fontSize: '16px' }}>
  Please fill out the RSVP below!
  </span>
  <button 
  onClick={() => setShowReminder(false)}
  className="absolute right-4 text-[#4A3B32]/50 hover:text-[#4A3B32] text-xl cursor-pointer"
  >
  ✕
  </button>
  </motion.div>
 )}
 </AnimatePresence>

 {/* ═══ INDIAN THEMED BACKGROUNDS ═══ */}
 <img
 src="/top.png"
 alt=""
 className="absolute top-0 left-0 w-full h-auto pointer-events-none"
 />
 <img
 src="/bottom.png"
 alt=""
 className="absolute bottom-0 left-0 w-full h-auto pointer-events-none"
 />


 {/* ═══ SECTION 1: HERO ═══ */}
 <section ref={heroRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center px-4 py-12 overflow-x-hidden">
 <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center w-full">
<div className="mt-20 flex flex-col items-center justify-center">
 <motion.img
 src="/ganpati.png"
 alt="ganpati"
 className="mt-4 h-14 pointer-events-none"
 animate={{ y: [0, -10, 0] }}
 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
 />

 <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center mt-4">
 
 <motion.p 
 initial={{ opacity: 0, y: 30 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} 
 className={`mb-3 ${cormorant.className} font-medium`}
 style={{ fontSize: '20px' }}
 >
 With the blessings of our Families 
 </motion.p>
 
 <motion.h1 
 initial={{ opacity: 0, y: 30 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} 
 className={`text-[#7A2A39] leading-[1.0] mb-3 ${pinyon.className} relative z-20 py-2 px-2`}
 style={{ fontSize: '48px' }}
 >
 Chhaya <span className={`bg-clip-text mx-2 ${cormorant.className} font-light italic inline-block`} style={{ fontSize: '28px' }}>&amp;</span> Dwij
 </motion.h1>

 <motion.div
 initial={{ opacity: 0, y: 30 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} 
 className="mt-2 mb-6"
 >
 <p className={`mb-2 ${cormorant.className} font-medium text-[#4A3B32]`} style={{ fontSize: '20px' }}>
 are getting engaged
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 30 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }} 
 className="mb-8"
 >
 <p className={`my-2 ${cormorant.className} font-semibold text-[#4A3B32]`} style={{ fontSize: '28px' }}>
 July 19th
 </p>
 </motion.div>
 </div>

<div className="mt-10">
 <motion.div 
 initial={{ opacity: 0, y: 20 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }} 
 className="flex flex-col items-center justify-center w-full mb-3"
 >
 <p className={`text-center ${cormorant.className} font-medium mb-1`} style={{ fontSize: '18px' }}>
 Beloved Daughter of
 </p>
 <p className={`text-center ${cormorant.className} font-medium px-2 text-[#4A3B32]`} style={{ fontSize: '20px' }}>
 Jagrutiben &amp; Govind Langhnoda
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }} 
 className="overflow-visible"
 >
 <div className="flex items-center justify-center pointer-events-none overflow-visible">
    <span className={`py-1 text-[#7A2A39] ${pinyon.className} overflow-visible`} style={{ fontSize: '30px', display: 'block'}}>and</span>
  </div>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 20 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }} 
 className="flex flex-col items-center justify-center w-full mt-3 mb-12"
 >
 <p className={`text-center ${cormorant.className} font-medium mb-1`} style={{ fontSize: '18px' }}>
 Beloved Son of
 </p>
 <p className={`text-center ${cormorant.className} font-medium px-2 text-[#4A3B32]`} style={{ fontSize: '20px' }}>
 Kailashben &amp; Mitesh Patel
 </p>
 </motion.div>

 </div>
 </div>
 </motion.div>
 </section>
 
 
 {/* ═══ SECTION 2: COUNTDOWN TIMER ═══ */}
 <section ref={countdownRef} className="relative w-full py-12 z-10 px-4 flex justify-center items-center mb-20 ">
 <div className="w-full flex justify-center">
 <div className="w-full max-w-[420px] flex flex-col">
 <div className="pt-2 pb-8 px-4 flex flex-col items-center text-center">
 
 {/* Item 1: Countdown Numbers — fades up */}
 <motion.div style={{ opacity: cd0.opacity, y: cd0.y, scale: cd0.scale }} className="flex flex-col items-center w-full mb-16">
 <div className="flex items-center justify-between w-full max-w-[280px] text-[#4A3B32] font-normal tracking-wide font-serif" style={{ fontSize: '32px' }}>
 <span className="w-12 text-center tabular-nums">{String(timeLeft.days).padStart(2, "0")}</span>
 <span className="text-[#4A3B32] select-none pb-2">:</span>
 <span className="w-10 text-center tabular-nums">{String(timeLeft.hours).padStart(2, "0")}</span>
 <span className="text-[#4A3B32] select-none pb-2">:</span>
 <span className="w-10 text-center tabular-nums">{String(timeLeft.minutes).padStart(2, "0")}</span>
 <span className="text-[#4A3B32] select-none pb-2">:</span>
 <span className="w-10 text-center tabular-nums">{String(timeLeft.seconds).padStart(2, "0")}</span>
 </div>
 <div className="flex justify-between w-full max-w-[280px] font-medium text-[#4A3B32]/90 px-1 mt-1" style={{ fontSize: '14px' }}>
 <span className="w-12 text-center">Days</span>
 <span className="w-10 text-center">Hours</span>
 <span className="w-10 text-center">Minutes</span>
 <span className="w-10 text-center">Seconds</span>
 </div>
 </motion.div>

 {/* Item 2: "Where is it?" heading — fades up */}
 <motion.div style={{ opacity: cd1.opacity, y: cd1.y, scale: cd1.scale }}>
 <h1 className={`text-[#7A2A39] leading-[1.0] ${pinyon.className} relative z-20 px-2 mb-2`} style={{ fontSize: '36px' }}>
 Where is it?
 </h1>
 </motion.div>

 {/* Item 3: Address + Directions button — fades up */}
 <motion.div style={{ opacity: cd2.opacity, y: cd2.y, scale: cd2.scale }}>
 <p className={`${cormorant.className} font-medium`} style={{ fontSize: '20px' }}>
 Beaumont Community Centre
 </p>
 <p className={`mb-6 ${cormorant.className} font-medium`} style={{ fontSize: '20px' }}>
 5204 50 Ave, Beaumont, AB T4X 1E3
 </p>
 <motion.a
 href="https://www.google.com/maps/search/?api=1&query=Beaumont+Community+Centre+5204+50+Ave+Beaumont+AB+T4X+1E3"
 target="_blank"
 rel="noopener noreferrer"
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.97 }}
 className={`block mt-4 text-center cursor-pointer bg-[#7A2A39] text-[#FCF9F2] ${cormorant.className} font-bold py-2 px-4 rounded-[10px] mx-6 hover:brightness-110 transition-all`}
 style={{ fontSize: '16px' }}
 >
 Get Directions
 </motion.a>
 </motion.div>


 <motion.div style={{ opacity: cd1.opacity, y: cd1.y, scale: cd1.scale }}>
 <h1 className={`text-[#7A2A39] leading-[1.0] ${pinyon.className} relative z-20 px-2 mb-2 mt-12 `} style={{ fontSize: '36px' }}>
 When is it?
 </h1>
 </motion.div>

 {/* Item 3: Address + Directions button — fades up */}
 <motion.div style={{ opacity: cd2.opacity, y: cd2.y, scale: cd2.scale }} className="">
 <p className={`${cormorant.className} font-medium`} style={{ fontSize: '20px' }}>
 From <span className="font-bold">9:00 am to 1:00 pm</span>
 </p>
 </motion.div>
 </div>
 </div>
 </div>
 </section>

 {/* ═══ SECTION 3: INVITE ═══ */}
 <section ref={inviteRef} className="relative w-full py-12 z-10 px-4 flex justify-center items-center mb-20 ">
 <div className="w-full flex justify-center">
 <div className="w-full flex flex-col">

 <div className="pt-2 flex flex-col items-center text-center">
 {/* Item 1: Heading — fades up */}
 <motion.h1 
 style={{ opacity: inv0.opacity, y: inv0.y, scale: inv0.scale, fontSize: '36px' }} 
 className={`w-full text-[#7A2A39] leading-[1.0] ${pinyon.className} relative z-20 mb-3 `}
 >
 Dear friends and family!
 </motion.h1>

 {/* Item 2: Para 1 — fades up */}
 <motion.p 
 style={{ opacity: inv1.opacity, y: inv1.y, fontSize: '20px' }} 
 className={`mb-2 ${cormorant.className} font-medium`}
 >
 Together with our families, we look forward to celebrating a day filled with love, laughter, and cherished memories. We would be delighted to have you join us. 
 </motion.p>
 </div>

 {/* Item 3: Image — fades up */}
 <motion.div 
 style={{ opacity: inv2.opacity, y: inv2.y, scale: inv2.scale }} 
 className="w-full mx-auto flex justify-center mt-10 "
 >
 <img
 src="/eng2.jpeg"
 alt="Chhaya & Dwij"
 className="w-full h-auto max-h-[400px] object-cover pointer-events-none rounded-sm"
 />
 </motion.div>

 </div>
 </div>
 </section>


 {/* ═══ RSVP SECTION ═══ */}
 <section ref={rsvpRef} className="relative w-full py-8 px-4 flex justify-center mb-[45vh] ">
 <div className="w-full max-w-xl">
 {rsvpSubmitted ? (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center"
 >
 <p className={`text-[#7A2A39] ${pinyon.className}`} style={{ fontSize: '32px' }}>
 {rsvp === "yes" ? "We can\u0027t wait to see you!" : "We\u0027ll miss you! Thank you for letting us know."}
 </p>
 </motion.div>
 ) : (
 <>
 {/* Item 1: Title */}
 <motion.h1 
 style={{ opacity: rsvp0.opacity, y: rsvp0.y, scale: rsvp0.scale, fontSize: '36px' }} 
 className={`text-center text-[#7A2A39] mb-2 ${pinyon.className}`}
 >
 Be Our Guest
 </motion.h1>

 {/* Item 2: Subtitle */}
 <motion.p 
 style={{ opacity: rsvp1.opacity, y: rsvp1.y, fontSize: '16px' }} 
 className={`text-center mb-4 text-[#4A3B32] ${cormorant.className} font-medium`}
 >
 Kindly let us know if you can join our celebration.
 </motion.p>

 {/* Item 3: Form */}
 <motion.div style={{ opacity: rsvp2.opacity, y: rsvp2.y }}>
 {/* ── Full Name ── */}
 <label className={`block pl-3 mb-1 text-[#7A2A39] ${cormorant.className} font-semibold`} style={{ fontSize: '16px' }}>
 Full Name <span className="text-red-500">*</span>
 </label>
 <input
 id="rsvp-name"
 type="text"
 value={rsvpName}
 onChange={(e) => { setRsvpName(e.target.value); if (e.target.value.trim()) setRsvpNameError(false); }}
 placeholder="e.g. Dwij Patel"
 className={`w-full px-3 py-2 rounded-[10px] bg-white text-[#4A3B32] border border-[#D8A4A4] shadow-sm focus:outline-none focus:border-[#7A2A39] transition-all ${cormorant.className} ${rsvpNameError ? 'ring-2 ring-red-400' : ''}`}
 style={{ fontSize: '16px' }}
 />
 {rsvpNameError && (
 <p className={`pl-3 mt-1 text-red-500 ${cormorant.className}`} style={{ fontSize: '14px' }}>
 Please enter your full name to continue.
 </p>
 )}

 {/* ── Will you attend? ── */}
 <label className={`block pl-3 mt-4 mb-1 text-[#7A2A39] ${cormorant.className} font-semibold`} style={{ fontSize: '16px' }}>
 Will you be attending?
 </label>
 <div className="grid grid-cols-2 gap-4 ">
 <motion.button
 id="rsvp-yes"
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => handleRsvpAttend("yes")}
 className={`py-2 rounded-[10px] cursor-pointer transition-all duration-200 border ${cormorant.className} ${
 rsvp === "yes"
 ? "bg-[#7A2A39] text-[#FCF9F2] border-[#7A2A39] font-bold"
 : "bg-white text-[#4A3B32] border-[#D8A4A4] hover:border-[#7A2A39]"
 }`}
 style={{ fontSize: '16px' }}
 >
 Yes
 </motion.button>
 <motion.button
 id="rsvp-no"
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => handleRsvpAttend("no")}
 className={`py-2 rounded-[10px] cursor-pointer transition-all duration-200 border ${cormorant.className} ${
 rsvp === "no"
 ? "bg-[#7A2A39] text-[#FCF9F2] border-[#7A2A39] font-bold"
 : "bg-white text-[#4A3B32] border-[#D8A4A4] hover:border-[#7A2A39]"
 }`}
 style={{ fontSize: '16px' }}
 >
 No
 </motion.button>
 </div>

 {/* ── If Yes: show guest count then submit ── */}
 {rsvp === "yes" && (
 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <label className={`block pl-3 mt-4 mb-1 text-[#7A2A39] ${cormorant.className} font-semibold`} style={{ fontSize: '16px' }}>
 How many people will be attending? <span className="text-red-500">*</span>
 </label>
 <input
 id="rsvp-guests"
 type="number"
 min="1"
 value={rsvpGuests}
 onChange={(e) => { 
 setRsvpGuests(e.target.value); 
 if (e.target.value.trim() && parseInt(e.target.value, 10) > 0) {
 setRsvpGuestsError(false);
 }
 }}
 placeholder="e.g. 4"
 className={`w-full px-3 py-2 rounded-[10px] bg-white text-[#4A3B32] border border-[#D8A4A4] shadow-sm focus:outline-none focus:border-[#7A2A39] transition-all ${cormorant.className} ${rsvpGuestsError ? 'ring-2 ring-red-400' : ''}`}
 style={{ fontSize: '16px' }}
 />
 {rsvpGuestsError && (
 <p className={`pl-3 mt-1 text-red-500 ${cormorant.className}`} style={{ fontSize: '14px' }}>
 Please enter at least 1 guest.
 </p>
 )}
 <div className="flex justify-center mt-6">
 <motion.button
 id="rsvp-submit-yes"
 type="button"
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.97 }}
 onClick={handleRsvpSubmit}
 disabled={rsvpLoading}
 className={`px-6 py-2 rounded-[10px] bg-[#7A2A39] text-[#FCF9F2] font-bold cursor-pointer hover:brightness-110 transition-all ${cormorant.className} ${rsvpLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
 style={{ fontSize: '16px' }}
 >
 {rsvpLoading ? 'Sending...' : 'Confirm RSVP'}
 </motion.button>
 </div>
 </motion.div>
 )}

 {/* ── If No: show submit immediately ── */}
 {rsvp === "no" && (
 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex justify-center mt-6">
 <motion.button
 id="rsvp-submit-no"
 type="button"
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.97 }}
 onClick={handleRsvpSubmit}
 disabled={rsvpLoading}
 className={`px-6 py-2 rounded-[10px] bg-[#7A2A39] text-[#FCF9F2] font-bold cursor-pointer hover:brightness-110 transition-all ${cormorant.className} ${rsvpLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
 style={{ fontSize: '16px' }}
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
 style={{ fontSize: '14px' }}
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
    </div>
  );
}
