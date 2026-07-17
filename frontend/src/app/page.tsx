"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { metricService } from "@/services/metric.service";
import { simulationService } from "@/services/simulation.service";
import { LiveMetric, Strategy } from "@/types/api";
import Button from "@/components/Button";
import Input from "@/components/Input";
import EventCard from "@/components/EventCard";
import Modal from "@/components/Modal";
import Accordion from "@/components/Accordion";
import MetricsDashboard from "@/components/MetricsDashboard";

export default function Home() {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: 0,
    available_tickets: 0,
  });

  const [liveMetric, setLiveMetric] = useState<LiveMetric | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await metricService.getLiveMetrics();
        setLiveMetric(data);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      }
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1500); // Poll every 1.5s
    return () => clearInterval(interval);
  }, []);

  const handleBuyClick = (id: string) => {
    setSelectedEventId(id);
    setPurchaseQuantity(1);
    setPurchaseModalOpen(true);
  };

  const handleRunSimulation = async (strategy: Strategy, requestsCount: number) => {
    setSimulationModalOpen(false);
    
    const targetTicketId = liveMetric?.tickets?.[0]?.ticketId;
    if (!targetTicketId) {
      toast.error("Tidak ada tiket yang aktif untuk disimulasikan!");
      return;
    }

    setIsSimulating(true);
    toast.loading(`Menjalankan simulasi (${requestsCount} reqs) [${strategy}]...`, { id: 'sim-toast' });

    try {
      const completed = await simulationService.runLoadSimulation(targetTicketId, requestsCount, strategy);
      toast.success(`Simulasi selesai! ${completed} requests diproses.`, { id: 'sim-toast' });
    } catch (err) {
      toast.error("Gagal menjalankan simulasi", { id: 'sim-toast' });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-[#EAE6E1] bg-[#FDFBF7]/85 backdrop-blur-md dark:border-[#36322F] dark:bg-[#1A1817]/85 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/cupcake_ticket.svg"
              alt="VelvetFlow Logo"
              width={40}
              height={40}
            />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Velvet<span className="text-[#C83E4D] dark:text-[#D44D5C]">Flow</span>
              </h1>
              <p className="text-[10px] text-[#597864] dark:text-[#6B8E7B] uppercase tracking-widest font-semibold">
                Flash-Sale Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Backend Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Ultra-Compact Banner */}
        <div className="bg-[#FFFFFF] dark:bg-[#242220]/60 border border-[#EAE6E1] dark:border-[#36322F]/80 rounded-full py-2 px-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#597864] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#597864]"></span>
            </span>
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold text-[#C83E4D] dark:text-[#D44D5C] whitespace-nowrap">Live System Monitor</span>
              <span className="text-xs text-[#7A726D] dark:text-[#9C958E] hidden sm:inline truncate">
                &bull; Observe how Hono + Redis SETNX prevents race conditions.
              </span>
            </div>
          </div>
          
          <a
            href="https://github.com/zzeeyyaa/velvet-flow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-wider font-bold text-[#2C2825] dark:text-[#FDFBF7] hover:text-[#597864] transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"
          >
            Baca Docs
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

        {/* Action Panel for Simulation */}
        <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-br from-[#2C2825] to-[#1A1817] dark:from-[#242220] dark:to-[#121110] rounded-2xl shadow-xl shadow-[#2C2825]/10 p-6 sm:p-8 gap-6 border border-[#36322F]">
          {/* Decorative background glow elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[#C83E4D]/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-[#597864]/20 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-[#FDFBF7] shadow-inner border border-white/10 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#FDFBF7]">Load Simulation</h3>
              <p className="text-sm text-[#9C958E] mt-1 max-w-md">
                Uji ketahanan sistem terhadap lonjakan ribuan request secara bersamaan untuk mendeteksi bottleneck.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 w-full sm:w-auto shrink-0">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-[0_0_20px_rgba(200,62,77,0.3)] hover:shadow-[0_0_30px_rgba(200,62,77,0.5)] group border border-white/10" onClick={() => setSimulationModalOpen(true)}>
              <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                Mulai Simulasi
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
            </Button>
          </div>
        </div>

        {/* Live Metrics Dashboard */}
        {liveMetric && (
          <MetricsDashboard
            perStrategy={liveMetric.perStrategy}
            totalOrders={liveMetric.totalOrders}
            isSimulating={isSimulating}
          />
        )}

        {/* Events Grid (Now Full Width) */}
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-[#2C2825] dark:text-[#FDFBF7]">Upcoming Events</h3>
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
                + Create Event
              </Button>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCard
              id="evt-1"
              title="Coldplay: Music of the Spheres"
              description="Experience the magic of Coldplay live in concert. A spectacular show of lights, music, and unforgettable moments."
              date="Dec 15, 2026 - 19:00"
              location="Gelora Bung Karno, Jakarta"
              price={150}
              availableTickets={2500}
              imageUrl="https://images.unsplash.com/photo-1540039155733-d7696d4eb49e?auto=format&fit=crop&w=800&q=80"
              onBuyTicket={handleBuyClick}
            />
            <EventCard
              id="evt-2"
              title="Taylor Swift: The Eras Tour"
              description="A journey through the musical eras of Taylor Swift. The most anticipated concert of the decade."
              date="Jan 10, 2027 - 18:30"
              location="National Stadium, Singapore"
              price={200}
              availableTickets={0}
              imageUrl="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80"
              onBuyTicket={handleBuyClick}
            />
            <EventCard
              id="evt-3"
              title="Bruno Mars: 24K Magic World Tour"
              description="Get ready to groove with Bruno Mars! An electrifying night filled with his greatest hits and amazing dance routines."
              date="Mar 05, 2027 - 20:00"
              location="ICE BSD City, Tangerang"
              price={120}
              availableTickets={150}
              imageUrl="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"
              onBuyTicket={handleBuyClick}
            />
          </div>
        </div>
      </main>

      {/* Purchase Modal */}
      <Modal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        title="Beli Tiket"
      >
        <div className="space-y-6">
          <p className="text-sm text-[#7A726D] dark:text-[#9C958E]">
            Simulasi pembelian tiket untuk event <strong className="text-[#C83E4D] dark:text-[#D44D5C]">{selectedEventId}</strong>.
          </p>
          <div className="space-y-1">
            <Input 
              label="Jumlah Tiket" 
              type="number" 
              value={purchaseQuantity} 
              onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
              min={1}
              max={4}
            />
            <p className="text-xs text-[#7A726D]">Maksimal 4 tiket per transaksi.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setPurchaseModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => {
              toast.success(`Berhasil Mensimulasikan Pembelian`, {
                description: `Mensimulasikan pembelian ${purchaseQuantity} tiket...`
              });
              setPurchaseModalOpen(false);
            }}>
              Konfirmasi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Simulation Options Modal */}
      <Modal
        isOpen={simulationModalOpen}
        onClose={() => setSimulationModalOpen(false)}
        title="Pilih Skenario Simulasi"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#7A726D] dark:text-[#9C958E] mb-2">
            Pilih jenis beban trafik (load) yang ingin di-test ke sistem backend.
          </p>
          <Accordion
            items={[
              {
                id: "vulnerable",
                title: "1. Normal Day (Vulnerable)",
                content: (
                  <div className="flex flex-col gap-3">
                    <p>Standard requests using traditional DB constraints. Does not use Redis lock. Can result in overselling during high concurrency.</p>
                    <Button variant="outline" size="sm" onClick={() => handleRunSimulation("vulnerable", 50)} className="w-full">
                      Mulai Simulasi Vulnerable (50 req)
                    </Button>
                  </div>
                ),
              },
              {
                id: "semi_resilient",
                title: "2. Flash Sale (Semi-Resilient)",
                content: (
                  <div className="flex flex-col gap-3">
                    <p>Uses Redis SETNX for lock, but lacks idempotency. Prone to issues if failures occur mid-transaction.</p>
                    <Button variant="primary" size="sm" onClick={() => handleRunSimulation("semi_resilient", 200)} className="w-full">
                      Mulai Simulasi Semi-Resilient (200 req)
                    </Button>
                  </div>
                ),
              },
              {
                id: "resilient",
                title: "3. Chaos Mode (Resilient)",
                content: (
                  <div className="flex flex-col gap-3">
                    <p>Uses Redis SETNX lock with idempotency. Guarantees safe transactions and prevents overselling even with high failure rates.</p>
                    <Button variant="secondary" size="sm" onClick={() => handleRunSimulation("resilient", 300)} className="w-full">
                      Mulai Simulasi Resilient (300 req)
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Modal>
      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Buat Event Baru"
      >
        <div className="space-y-4">
          <Input 
            label="Judul Event" 
            placeholder="Misal: Konser Musik 2026"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <Input 
            label="Deskripsi" 
            placeholder="Deskripsi singkat event..."
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <Input 
            label="Tanggal" 
            type="text"
            placeholder="Misal: Dec 15, 2026 - 19:00"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
          <Input 
            label="Lokasi" 
            placeholder="Misal: Gelora Bung Karno"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                label="Harga ($)" 
                type="number"
                value={newEvent.price}
                onChange={(e) => setNewEvent({ ...newEvent, price: Number(e.target.value) })}
              />
            </div>
            <div className="flex-1">
              <Input 
                label="Kapasitas Tiket" 
                type="number"
                value={newEvent.available_tickets}
                onChange={(e) => setNewEvent({ ...newEvent, available_tickets: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => {
              toast.success("Event Dibuat", {
                description: `Mensimulasikan pembuatan event: ${newEvent.title}`
              });
              setCreateModalOpen(false);
            }}>
              Simpan Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
