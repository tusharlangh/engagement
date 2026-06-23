"use client";

import { motion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";

// ── Fonts ───────────────────────────────────────────
// Premium luxury serif for headings
const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"]
});

// Extremely elegant luxury script for names
const pinyon = Pinyon_Script({ 
  weight: "400", 
  subsets: ["latin"] 
});


// ── Animation Variants ──────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 },
  }),
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 },
  }),
};




// ───────────────────────────────────────────────────────
export default function EngagementInvite() {
  const [rsvp, setRsvp] = useState<"yes" | "no" | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState("");
  const [rsvpNameError, setRsvpNameError] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    guests: "",
    dietary: "",
  });

  const handleRsvpAttend = (choice: "yes" | "no") => {
    if (!rsvpName.trim()) {
      setRsvpNameError(true);
      return;
    }
    setRsvpNameError(false);
    setRsvp(choice);
  };

  const handleRsvpSubmit = () => {
    if (!rsvpName.trim()) {
      setRsvpNameError(true);
      return;
    }
    setRsvpSubmitted(true);
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false
  });



  useEffect(() => {
    // Target date: July 19, 2026, 15:30:00 (India Standard Time = UTC + 5:30)
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
    // Show after 2 seconds
    const showTimer = setTimeout(() => setShowReminder(true), 2000);
    // Hide after 12 seconds total
    const hideTimer = setTimeout(() => setShowReminder(false), 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // ── Section Refs for parallax ────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const countdownRef = useRef<HTMLElement>(null);
  const inviteRef = useRef<HTMLElement>(null);
  const rsvpRef = useRef<HTMLElement>(null);

  // Hero parallax — content drifts up slowly as you scroll away
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

  // Countdown — rises up and fades in as it enters view
  const { scrollYProgress: countdownProgress } = useScroll({ target: countdownRef, offset: ["start end", "end start"] });
  const countdownY = useTransform(countdownProgress, [0, 0.4, 1], [60, 0, -40]);
  const countdownOpacity = useTransform(countdownProgress, [0, 0.25, 0.8, 1], [0, 1, 1, 0]);

  // Invite section — text drifts from right, image from left
  const { scrollYProgress: inviteProgress } = useScroll({ target: inviteRef, offset: ["start end", "end start"] });
  const inviteTextX = useTransform(inviteProgress, [0, 0.4, 1], [50, 0, -20]);
  const inviteImgX = useTransform(inviteProgress, [0, 0.4, 1], [-50, 0, 20]);
  const inviteOpacity = useTransform(inviteProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0]);

  // RSVP — rises gently into view, no fade out (stays visible)
  const { scrollYProgress: rsvpProgress } = useScroll({ target: rsvpRef, offset: ["start end", "center center"] });
  const rsvpY = useTransform(rsvpProgress, [0, 1], [80, 0]);
  const rsvpOpacity = useTransform(rsvpProgress, [0, 0.4], [0, 1]);

  return (
    <main className={`min-h-screen text-[#4A433E] ${cormorant.className} overflow-x-hidden selection:text-white relative`}>
      {/* ═══ RSVP REMINDER POPUP ═══ */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#FBF7EF] px-4 md:px-6 py-2 md:py-3 rounded-[15px] shadow-lg flex items-center gap-3 w-full md:w-auto max-w-md ${cormorant.className}`}
          >
            <span className="text-[18px] md:text-[22px] font-medium text-black text-center flex-1">
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

{/* Bottom Background */}
<img
  src="/bottom_bg.PNG"
  alt=""
  className="absolute bottom-0 left-0 w-full h-auto pointer-events-none"
/>

      


      {/* ═══ SECTION 1: HERO ═══ */}
      <section ref={heroRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center px-6 py-16 md:py-24 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center w-full">
          <motion.img
            src="/ganpati.png"
            alt="ganpati"
            className="mt-4 h-20 pointer-events-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center mt-4">
            
            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className={`text-[25px] mb-4 ${cormorant.className} font-medium`}>
              With the blesses of our Families 
            </motion.p>
            
            <motion.h1 
              initial="hidden" animate="visible" variants={fadeUp} custom={1} 
              className={`text-[48px] md:text-[96px] text-[#837834] leading-[1.0] mb-4 ${pinyon.className} relative z-20 py-4 px-2`}
            >
              Chhaya <span className={`text-[28px] sm:text-[42px] md:text-[54px] bg-clip-text mx-4 ${cormorant.className} font-light italic inline-block`}>&amp;</span> Dwij
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className={`text-[25px] mb-4 ${cormorant.className} font-medium`}>
              Are getting engaged On
            </motion.p>
            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className={`text-[35px] ${cormorant.className} font-semibold`}>
              July 16th
            </motion.p>

            {/*
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="relative z-20 w-full max-w-[850px] aspect-[16/9] sm:aspect-[21/9] overflow-hidden flex items-center justify-center group">
              <img 
                src="/eng.jpg" 
                alt="Chhaya &amp; Dwij Engagement" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter sepia-[12%] contrast-[95%] saturate-[90%]" 
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0) 98%)',
                  maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0) 98%)'
                }}
              />
              <div 
                className="absolute inset-0 bg-[#8C7A6B]/5 mix-blend-color-burn pointer-events-none z-20"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0) 98%)',
                  maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0) 98%)'
                }}
              />
            </motion.div>
            */}
          </div>
        </motion.div>
      </section>
          
      {/* ═══ SECTION 2: COUNTDOWN TIMER ═══ */}
      <section ref={countdownRef} className="relative w-full py-16 md:py-24 z-10 px-6 flex justify-center items-center mb-100">
        <motion.div style={{ y: countdownY, opacity: countdownOpacity }} className="w-full flex justify-center">
          {/* Main Card Container */}
          <div className="w-full max-w-[420px] flex flex-col">
            
            {/* Header Text Area */}
            <div className="pt-2 pb-8 px-4 flex flex-col items-center text-center">
              
              
              {/* Countdown Numbers Group */}
              <div className="flex flex-col items-center w-full mb-16">
                {/* Numbers Row */}
                <div className="flex items-center justify-between w-full max-w-[320px] text-black text-[38px] sm:text-[44px] font-normal tracking-wide font-serif">
                  <span className="w-16 text-center tabular-nums">{String(timeLeft.days).padStart(2, "0")}</span>
                  <span className="text-black select-none pb-2">:</span>
                  <span className="w-12 text-center tabular-nums">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="text-black select-none pb-2">:</span>
                  <span className="w-12 text-center tabular-nums">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="text-black select-none pb-2">:</span>
                  <span className="w-12 text-center tabular-nums">{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
                
                {/* Labels Row */}
                <div className="flex justify-between w-full max-w-[320px] text-[15px] font-light text-black px-1">
                  <span className="w-16 text-center">Days</span>
                  <span className="w-12 text-center">Hours</span>
                  <span className="w-12 text-center">Minutes</span>
                  <span className="w-12 text-center">Seconds</span>
                </div>
              </div>

              <div>
                <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className={`text-[48px] text-black leading-[1.0] ${pinyon.className} relative z-20 px-2 mb-2`}>
                  Where is it?
                </motion.h1>
                <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className={`text-[25px] ${cormorant.className} font-medium`}>
                  Beaumont Community Centre
                </motion.p>
                <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className={`text-[25px] mb-8 ${cormorant.className} font-medium`}>
                  5204 50 Ave, Beaumont, AB T4X 1E3
                </motion.p>
                <motion.a
                  href="https://www.google.com/maps/search/?api=1&query=Beaumont+Community+Centre+5204+50+Ave+Beaumont+AB+T4X+1E3"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={2}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`block mt-10 text-center cursor-pointer text-[25px] bg-[#FCCBBF] ${cormorant.className} font-medium py-2 px-3 rounded-[10px] mx-20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:brightness-95 transition-all`}
                >
                  Get Directions
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ SECTION 3: INVITE ═══ */}
      <section ref={inviteRef} className="relative w-full py-16 md:py-24 z-10 px-6 flex justify-center items-center mb-100">
        <motion.div className="w-full flex justify-center">
          <div className="w-1/2 flex flex-col">

            {/* Text slides in from right */}
            <motion.div style={{ x: inviteTextX, opacity: inviteOpacity }} className="pt-2 flex flex-col items-center text-center">
              <h1 className={`w-full text-[48px] text-black leading-[1.0] ${pinyon.className} relative z-20 mb-4`}>
                Dear friends and family!
              </h1>
              <p className={`text-[25px] mb-2 ${cormorant.className} font-medium`}>
                We are thrilled to announce a special event happening this summer our engagement!
              </p>
              <p className={`text-[25px] mb-2 ${cormorant.className} font-medium`}>
                This day wouldn't be complete without our closest loved ones, so we warmly invite you to join us and celebrate this joyful occasion together.
              </p>
              <p className={`text-[25px] ${cormorant.className} font-medium`}>
                We can't wait to share this memorable moment with you!
              </p>
            </motion.div>

            {/* Image slides in from left */}
            <motion.div style={{ x: inviteImgX, opacity: inviteOpacity }} className="w-1/2 mx-auto flex justify-center mt-20">
              <img
                src="/eng2.jpg"
                alt="Chhaya & Dwij"
                className="h-120 object-cover pointer-events-none"
              />
            </motion.div>

          </div>
        </motion.div>
      </section>


      {/* ═══ RSVP SECTION ═══ */}
      <section ref={rsvpRef} className="relative w-full py-16 md:py-24 px-4 flex justify-center mb-175">
        <motion.div
          style={{ y: rsvpY, opacity: rsvpOpacity }}
          className="w-full max-w-xl"
        >
          <h1 className={`text-center text-[48px] text-black mb-4 ${pinyon.className}`}>
            Be Our Guest
          </h1>
          <p className={`text-center text-[25px] mb-10 ${cormorant.className} font-medium`}>
            Kindly let us know if you can join our celebration.
          </p>

          {rsvpSubmitted ? (
            /* ── Confirmation message ── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <p className={`text-[35px] text-black ${pinyon.className}`}>
                {rsvp === "yes" ? "We can't wait to see you!" : "We'll miss you! Thank you for letting us know."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* ── Full Name ── */}
              <label className={`block pl-3 mb-2 text-[25px] ${cormorant.className} font-medium`}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="rsvp-name"
                type="text"
                value={rsvpName}
                onChange={(e) => { setRsvpName(e.target.value); if (e.target.value.trim()) setRsvpNameError(false); }}
                placeholder="e.g. Dwij Patel"
                className={`w-full px-4 py-2 rounded-[10px] bg-[#FBF7EF] text-[25px] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:outline-none transition-all ${cormorant.className} ${rsvpNameError ? 'ring-2 ring-red-400' : ''}`}
              />
              {rsvpNameError && (
                <p className={`pl-3 mt-1 text-[18px] text-red-400 ${cormorant.className}`}>
                  Please enter your full name to continue.
                </p>
              )}

              {/* ── Will you attend? ── */}
              <label className={`block pl-3 mt-8 mb-2 text-[25px] ${cormorant.className} font-medium`}>
                Will you be attending?
              </label>
              <div className="grid grid-cols-2 gap-8">
                <motion.button
                  id="rsvp-yes"
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRsvpAttend("yes")}
                  className={`py-2 rounded-[10px] text-[25px] cursor-pointer transition-all duration-200 ${cormorant.className} ${
                    rsvp === "yes"
                      ? "bg-[#FCD66B] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                      : "bg-[#FBF7EF] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-[#FCD66B]/50"
                  }`}
                >
                  Yes
                </motion.button>
                <motion.button
                  id="rsvp-no"
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRsvpAttend("no")}
                  className={`py-2 rounded-[10px] text-[25px] cursor-pointer transition-all duration-200 ${cormorant.className} ${
                    rsvp === "no"
                      ? "bg-[#FCD66B] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                      : "bg-[#FBF7EF] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-[#FCD66B]/50"
                  }`}
                >
                  No
                </motion.button>
              </div>

              {/* ── If Yes: show guest count then submit ── */}
              {rsvp === "yes" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <label className={`block pl-3 mt-8 mb-2 text-[25px] ${cormorant.className} font-medium`}>
                    How many people will be attending?
                  </label>
                  <input
                    id="rsvp-guests"
                    type="number"
                    min="1"
                    value={rsvpGuests}
                    onChange={(e) => setRsvpGuests(e.target.value)}
                    placeholder="e.g. 4"
                    className={`w-full px-4 py-2 rounded-[10px] bg-[#FBF7EF] text-[25px] text-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:outline-none ${cormorant.className}`}
                  />
                  <div className="flex justify-center mt-10">
                    <motion.button
                      id="rsvp-submit-yes"
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleRsvpSubmit}
                      className={`px-10 py-2 rounded-[10px] bg-[#FCCBBF] text-[25px] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer hover:brightness-95 transition-all ${cormorant.className}`}
                    >
                      Confirm RSVP
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
                    className={`px-10 py-2 rounded-[10px] bg-[#FCCBBF] text-[25px] text-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer hover:brightness-95 transition-all ${cormorant.className}`}
                  >
                    Confirm RSVP
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </section>

  
    </main>
  );
}
