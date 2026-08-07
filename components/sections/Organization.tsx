"use client";

import { motion } from "framer-motion";
import { Users, ShieldCheck, Star, Crown, Medal, PenTool, Wallet, Megaphone } from "lucide-react";
import { SectionHeading, HighlightText } from "@/components/ui";

// Icon mapping
const getIcon = (jabatan: string) => {
  if (jabatan.startsWith("Sekretaris")) return PenTool;
  if (jabatan.startsWith("Bendahara")) return Wallet;
  if (jabatan.startsWith("Humas")) return Megaphone;
  
  switch (jabatan) {
    case "Pelindung": return ShieldCheck;
    case "Pembina": return Star;
    case "Ketua": return Crown;
    case "Wakil": return Medal;
    default: return Users;
  }
};

import organizationData from "@/data/organization.json";

const { topLevels, branches, bottomLevel } = organizationData;

const NodeCard = ({ jabatan, nama, isHighlight = false, delay = 0 }: { jabatan: string, nama: string, isHighlight?: boolean, delay?: number }) => {
  const Icon = getIcon(jabatan);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`relative z-10 flex flex-col items-center justify-center p-5 w-[220px] rounded-2xl border ${
        isHighlight 
          ? "bg-accent-yellow-500 border-accent-yellow-400 text-primary-900 shadow-[0_0_30px_rgba(255,193,7,0.3)]" 
          : "bg-primary-800 border-primary-700 text-white hover:border-primary-500 hover:shadow-[0_0_20px_rgba(25,118,210,0.15)]"
      } transition-all duration-300`}
    >
      <div className={`mb-3 p-3 rounded-xl border ${isHighlight ? 'bg-primary-900/10 border-primary-900/20' : 'bg-primary-700 border-primary-600'}`}>
        <Icon size={24} className={isHighlight ? "text-primary-900" : "text-primary-300"} />
      </div>
      <h3 className="font-display font-bold text-base uppercase tracking-wider mb-1 text-center">{jabatan}</h3>
      <p className={`text-sm text-center ${isHighlight ? "text-primary-900/80 font-semibold" : "text-primary-300"}`}>
        {nama}
      </p>
    </motion.div>
  );
};

export default function Organization() {
  return (
    <section id="organisasi" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <SectionHeading
            align="center"
            heading={
              <>Pengurus <HighlightText color="yellow" rotate="left">GEMASIX</HighlightText></>
            }
            description="Digerakkan oleh pemuda-pemudi berdedikasi yang siap membawa perubahan positif untuk lingkungan Genuk Baru RT 06 RW 07."
          />
        </motion.div>

        {/* Tree Canvas */}
        <div className="relative flex flex-col items-center max-w-5xl mx-auto w-full z-10">
          
          {/* Main Continuous Vertical Line */}
          <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-0.5 bg-primary-700/60 -z-10" />

          {/* TOP LEVELS */}
          <div className="flex flex-col gap-12 w-full items-center">
            {topLevels.map((item, i) => (
              <NodeCard key={item.id} {...item} isHighlight={item.jabatan === "Ketua"} delay={i * 0.1} />
            ))}
          </div>

          {/* MID LEVELS (Branch) */}
          <div className="relative w-full mt-12 mb-12">
            
            {/* Desktop branch lines */}
            {/* Top horizontal branch line */}
            <div className="hidden md:block absolute top-[-24px] left-[16.666%] right-[16.666%] h-0.5 bg-primary-700/60 -z-10" />
            
            {/* Side drop lines from top branch */}
            <div className="hidden md:block absolute top-[-24px] left-[16.666%] w-0.5 h-[24px] bg-primary-700/60 -z-10" />
            <div className="hidden md:block absolute top-[-24px] right-[16.666%] w-0.5 h-[24px] bg-primary-700/60 -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
              {branches.map((col, colIndex) => (
                <div key={colIndex} className="flex flex-col items-center gap-12 relative">
                  {col.map((item, i) => (
                    <div key={item.id} className="relative flex flex-col items-center">
                      {/* Vertical line connecting stacked items (only left & right column, center uses main spine) */}
                      {i > 0 && colIndex !== 1 && (
                        <div className="hidden md:block absolute top-[-48px] w-0.5 h-[48px] bg-primary-700/60 -z-10" />
                      )}
                      <NodeCard {...item} delay={0.4 + (colIndex * 0.1) + (i * 0.1)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM LEVEL */}
          <NodeCard jabatan={bottomLevel.jabatan} nama={bottomLevel.nama} delay={0.8} />

        </div>

      </div>
    </section>
  );
}
