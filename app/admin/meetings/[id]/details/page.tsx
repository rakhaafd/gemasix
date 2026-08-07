"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { Meeting } from "@/lib/meetings";
import { Button, Skeleton } from "@/components/ui";
import { Calendar, Users, Image as ImageIcon, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) return;
    
    const fetchMeeting = async () => {
      try {
        const docRef = doc(clientDb, "meetings", meetingId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMeeting({ id: docSnap.id, ...docSnap.data() } as Meeting);
        } else {
          console.error("Meeting not found");
        }
      } catch (error) {
        console.error("Error fetching meeting:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeeting();
  }, [meetingId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-6">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex flex-col gap-8">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-5/6 mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
            <Skeleton className="h-8 w-56 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText size={64} className="text-neutral-300 mb-4" />
        <h2 className="text-2xl font-display font-bold text-primary-900 mb-2">Data Tidak Ditemukan</h2>
        <p className="text-neutral-500 mb-6">Dokumentasi rapat yang Anda cari tidak ada atau telah dihapus.</p>
        <Link href="/admin/meetings">
          <Button as="button" variant="primary" icon={ArrowLeft} iconPosition="left">
            Kembali ke Daftar Rapat
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          as="button"
          variant="ghost" 
          onClick={() => router.push("/admin/meetings")}
          className="!text-neutral-500 hover:!text-primary-900 !px-0"
        >
          <ArrowLeft size={18} className="mr-2" /> Kembali ke Daftar Rapat
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        {/* HEADER SECTION */}
        <div className="bg-primary-900 rounded-2xl p-6 md:p-8 border border-primary-800 text-white shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-800 text-primary-200 rounded-lg text-sm font-medium mb-4">
            <Calendar size={16} />
            {formatDate(meeting.date)}
          </div>
          <h1 className="text-3xl font-display font-bold text-white leading-tight max-w-2xl">
            {meeting.title}
          </h1>
        </div>

        {/* NOTULEN SECTION */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden w-full">
          <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-2 border-b border-neutral-100 pb-4">
            <FileText size={20} className="text-primary-500" /> Notulensi Rapat
          </h2>
          <div className="whitespace-pre-wrap text-neutral-700 text-base leading-relaxed font-medium">
            {meeting.minutes}
          </div>
        </div>

        {/* DOKUMENTASI SECTION */}
        {(meeting.meetingImageUrl || meeting.attendanceImageUrl) && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-2 border-b border-neutral-100 pb-4">
              <ImageIcon size={20} className="text-primary-500" /> Dokumentasi Terlampir
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {meeting.meetingImageUrl && (
                <div className="flex flex-col group">
                  <a 
                    href={meeting.meetingImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-neutral-200 mb-3 aspect-[4/3] bg-neutral-50"
                  >
                    <img 
                      src={meeting.meetingImageUrl} 
                      alt="Foto Rapat" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>
                  <div className="font-medium text-sm text-neutral-600 flex items-center gap-2">Foto Kegiatan Rapat
                  </div>
                </div>
              )}
              
              {meeting.attendanceImageUrl && (
                <div className="flex flex-col group">
                  <a 
                    href={meeting.attendanceImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-neutral-200 mb-3 aspect-[4/3] bg-neutral-50"
                  >
                    <img 
                      src={meeting.attendanceImageUrl} 
                      alt="Daftar Hadir" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>
                  <div className="font-medium text-sm text-neutral-600 flex items-center gap-2">Bukti Daftar Hadir
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
