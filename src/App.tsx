import { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PromptGenerator from './components/PromptGenerator';
import ServicesGrid from './components/ServicesGrid';
import InfoSections from './components/InfoSections';
import ServiceWorkspace from './components/ServiceWorkspace';

export default function App() {
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleServiceSelect = (id: string) => {
    setActiveServiceId(id);
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 font-cairo relative overflow-hidden selection:bg-purple-500/30">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl" />
      </div>
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          
          <div ref={workspaceRef} className="relative z-20">
            {(!activeServiceId || activeServiceId === 'prompt-gen') ? (
              <PromptGenerator />
            ) : (
              <ServiceWorkspace activeServiceId={activeServiceId} />
            )}
          </div>

          <ServicesGrid onSelectService={handleServiceSelect} activeServiceId={activeServiceId} />
          
          <InfoSections />
        </main>
      </div>
    </div>
  );
}
