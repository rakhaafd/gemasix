"use client";

import { useEffect, useState } from "react";
import { Users, FolderOpen, Calendar, MessageCircle, Wallet, ArrowRight } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import Link from "next/link";
import { AdminPageHeader } from "@/components/ui";

export default function AdminDashboardPage() {
  const [saldo, setSaldo] = useState<number>(0);
  const [totalPrograms, setTotalPrograms] = useState<number>(0);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Finance (Saldo)
    const unsubFinance = onSnapshot(collection(clientDb, "finance_transactions"), (snapshot) => {
      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "income" || data.type === "base_cash") total += data.amount;
        if (data.type === "expense") total -= data.amount;
      });
      setSaldo(total);
    });

    // 2. Programs
    const unsubPrograms = onSnapshot(collection(clientDb, "programs"), (snapshot) => {
      setTotalPrograms(snapshot.size);
    });

    // 3. Events
    const unsubEvents = onSnapshot(collection(clientDb, "events"), (snapshot) => {
      setTotalEvents(snapshot.size);
      
      // We can also extract recent activities from events
      const activities: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          title: data.title,
          type: "Agenda",
          date: new Date(data.date).getTime(),
          status: data.status,
          link: "/admin/events"
        });
      });
      // Sort and take top 5
      activities.sort((a, b) => b.date - a.date);
      setRecentActivities(activities.slice(0, 5));
      setIsLoading(false);
    });

    // 4. Messages
    const unsubMessages = onSnapshot(collection(clientDb, "messages"), (snapshot) => {
      setTotalMessages(snapshot.size);
    });

    return () => {
      unsubFinance();
      unsubPrograms();
      unsubEvents();
      unsubMessages();
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const stats = [
    { label: "Saldo Kas", value: formatCurrency(saldo), icon: Wallet, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Program Kerja", value: totalPrograms.toString(), icon: FolderOpen, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Agenda", value: totalEvents.toString(), icon: Calendar, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Pesan NGL", value: totalMessages.toString(), icon: MessageCircle, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Dashboard Overview" 
        description="Ringkasan data Karang Taruna GEMASIX secara real-time." 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm h-32 flex items-center">
              <div className="w-full flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-200 animate-pulse shrink-0"></div>
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
                  <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-neutral-500 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col">
          <h2 className="font-bold text-lg text-primary-900 mb-6">Aktivitas Terakhir</h2>
          
          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <Link href={activity.link} key={activity.id} className="group block">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50 transition-colors">
                      <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary-900 truncate group-hover:text-primary-600">{activity.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{activity.type} • {formatDate(activity.date)}</p>
                      </div>
                      <ArrowRight size={18} className="text-primary-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 text-neutral-400 text-sm border-2 border-dashed border-neutral-100 rounded-2xl">
                Belum ada aktivitas
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col">
          <h2 className="font-bold text-lg text-primary-900 mb-6">Aksi Cepat</h2>
          
          <div className="space-y-3 flex-1">
            <Link href="/admin/events" className="group block">
              <div className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <span className="block font-semibold text-primary-900 text-sm">Kelola Agenda & Event</span>
                <span className="block text-neutral-500 text-xs mt-1">Jadwalkan kegiatan atau cek status acara mendatang</span>
              </div>
            </Link>
            
            <Link href="/admin/finance" className="group block">
              <div className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <span className="block font-semibold text-primary-900 text-sm">Catat Pengeluaran Kas</span>
                <span className="block text-neutral-500 text-xs mt-1">Input nota, bukti transaksi, atau iuran warga</span>
              </div>
            </Link>
            
            <Link href="/admin/messages" className="group block">
              <div className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <span className="block font-semibold text-primary-900 text-sm">Lihat Kotak Masuk NGL</span>
                <span className="block text-neutral-500 text-xs mt-1">Baca pesan anonim, saran, atau masukan yang baru masuk</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
