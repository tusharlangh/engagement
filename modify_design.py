import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# 1. Add CornerMandala component and update PillSeparator
mandala_code = """/* ── corner mandala component ────────────────────────── */
function CornerMandala({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BF953F" />
          <stop offset="50%" stopColor="#FCF6BA" />
          <stop offset="100%" stopColor="#B38728" />
        </linearGradient>
      </defs>
      <path d="M0 0 L 100 0 C 100 50, 50 100, 0 100 Z" fill="url(#gold)" opacity="0.15" />
      <path d="M0 0 L 80 0 C 80 40, 40 80, 0 80 Z" fill="url(#gold)" opacity="0.25" />
      <path d="M0 0 L 60 0 C 60 30, 30 60, 0 60 Z" fill="url(#gold)" opacity="0.4" />
      <path d="M0 0 L 40 0 C 40 20, 20 40, 0 40 Z" fill="url(#gold)" opacity="0.6" />
      <path d="M0 0 L 20 0 C 20 10, 10 20, 0 20 Z" fill="url(#gold)" opacity="0.8" />
      
      <path d="M0 20 C 15 25, 25 15, 20 0" stroke="url(#gold)" strokeWidth="1" fill="none" />
      <path d="M0 40 C 30 50, 50 30, 40 0" stroke="url(#gold)" strokeWidth="1" fill="none" />
      <path d="M0 60 C 45 75, 75 45, 60 0" stroke="url(#gold)" strokeWidth="1" fill="none" />
      <path d="M0 80 C 60 100, 100 60, 80 0" stroke="url(#gold)" strokeWidth="1" fill="none" />
      
      <circle cx="10" cy="10" r="1.5" fill="url(#gold)" />
      <circle cx="20" cy="20" r="2" fill="url(#gold)" />
      <circle cx="30" cy="30" r="2.5" fill="url(#gold)" />
      <circle cx="40" cy="40" r="3" fill="url(#gold)" />
    </svg>
  );
}

/* ── pill separator component ────────────────────────── */
function PillSeparator() {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="block w-16 h-px bg-gradient-to-r from-transparent to-[#BF953F]" />
      <span className="block w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-[#FCF6BA] to-[#BF953F] shadow-[0_0_8px_rgba(191,149,63,0.6)]" />
      <span className="block w-16 h-px bg-gradient-to-l from-transparent to-[#BF953F]" />
    </div>
  );
}"""

# Replace PillSeparator
content = re.sub(r'/\* ── pill separator component ────────────────────────── \*/.*?}\n', mandala_code + "\n", content, flags=re.DOTALL)

# 2. Update Main Container
main_container_orig = """    <main className="min-h-screen bg-[#f8f8f8] flex justify-center">
      <div className="w-full max-w-[520px] bg-white shadow-xl relative overflow-hidden">
        {/* ═══ NAVY TOP BAR ═══ */}
        <div className="h-7 bg-[#3d536c] w-full" />"""

main_container_new = """    <main className="min-h-screen bg-gradient-to-br from-[#4a000e] via-[#8a1c31] to-[#4a000e] flex justify-center sm:py-10 relative overflow-hidden">
      {/* Glowing background orbs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#FF416C] rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[#FF4B2B] rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse pointer-events-none delay-1000" />
      
      <div className="w-full max-w-[520px] bg-[#FFFDF9] shadow-[0_0_40px_rgba(0,0,0,0.5)] sm:rounded-2xl relative overflow-hidden border-[6px] border-[#D4AF37]/30">
        
        {/* CORNER FLOWERS */}
        <CornerMandala className="absolute top-0 left-0 w-32 h-32 md:w-40 md:h-40" />
        <CornerMandala className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 scale-x-[-1]" />
        <CornerMandala className="absolute bottom-0 left-0 w-32 h-32 md:w-40 md:h-40 scale-y-[-1]" />
        <CornerMandala className="absolute bottom-0 right-0 w-32 h-32 md:w-40 md:h-40 scale-x-[-1] scale-y-[-1]" />

        {/* ═══ GOLD TOP BAR ═══ */}
        <div className="h-3 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#BF953F] w-full" />"""
content = content.replace(main_container_orig, main_container_new)

# 3. Update Bottom Bar
bottom_bar_orig = """        {/* ═══ NAVY BOTTOM BAR ═══ */}
        <div className="h-7 bg-[#3d536c] w-full" />"""
bottom_bar_new = """        {/* ═══ GOLD BOTTOM BAR ═══ */}
        <div className="h-3 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#BF953F] w-full mt-10" />"""
content = content.replace(bottom_bar_orig, bottom_bar_new)

# 4. Update Divider Bars
divider_orig = """        {/* ═══ NAVY DIVIDER BAR ═══ */}
        <div className="h-7 bg-[#3d536c] w-full mt-0" />"""
divider_new = """        {/* ═══ GOLD DIVIDER BAR ═══ */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#BF953F] to-transparent w-full my-6 opacity-60" />"""
content = content.replace(divider_orig, divider_new)

# 5. Update Colors
content = content.replace("text-[#4a4a4a]", "text-[#8a1c31]")
content = content.replace("text-[#333]", "text-[#4a000e]")
content = content.replace("text-gray-600", "text-[#6A2B3D]")
content = content.replace("text-gray-500", "text-[#8A1C31]/70")
content = content.replace("border-gray-300", "border-[#BF953F]/40")
content = content.replace("border-gray-400", "border-[#BF953F]/40")
content = content.replace("bg-[#1a8bb5]", "bg-gradient-to-r from-[#BF953F] to-[#8A1C31] shadow-lg shadow-[#8a1c31]/30")
content = content.replace("hover:bg-[#157a9f]", "hover:from-[#D4AF37] hover:to-[#A3223A]")
content = content.replace("bg-gradient-to-b from-sky-100 to-sky-200", "bg-gradient-to-br from-[#FFE3E1] to-[#FFD1D1] border-2 border-[#BF953F]/20")
content = content.replace("bg-gradient-to-b from-gray-100 to-gray-200", "bg-gradient-to-br from-[#FFE3E1] to-[#FFD1D1] border-2 border-[#BF953F]/20")
content = content.replace("bg-gray-200", "bg-gradient-to-br from-[#FFE3E1] to-[#FFD1D1] border-2 border-[#BF953F]/20")

# Write back
with open("src/app/page.tsx", "w") as f:
    f.write(content)

