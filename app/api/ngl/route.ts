import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { z } from "zod";
import webpush from "web-push";

const messageSchema = z.object({
  message: z.string().min(3, "Pesan terlalu singkat").max(1000, "Pesan terlalu panjang"),
});

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@gemasix.my.id";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = messageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors.message?.[0] || "Pesan tidak valid" },
        { status: 400 }
      );
    }

    const { message } = validated.data;

    const docRef = await addDoc(collection(clientDb, "messages"), {
      message,
      createdAt: serverTimestamp(),
    });


    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      try {
        const subsSnapshot = await getDocs(collection(clientDb, "push_subscriptions"));
        
        const previewText = message.length > 80 ? message.substring(0, 77) + "..." : message;
        const payload = JSON.stringify({
          title: "New NGL Message!",
          body: `"${previewText}"`,
          url: "/admin/messages",
          icon: "/icon.png",
        });

        const sendPromises = subsSnapshot.docs.map(async (subDoc) => {
          const subData = subDoc.data();
          const pushSubscription = {
            endpoint: subData.endpoint,
            keys: {
              p256dh: subData.keys?.p256dh,
              auth: subData.keys?.auth,
            },
          };

          try {
            await webpush.sendNotification(pushSubscription, payload);
          } catch (err: any) {
            if (err.statusCode === 404 || err.statusCode === 410) {
              console.log("Removing expired push subscription:", subDoc.id);
              await deleteDoc(doc(clientDb, "push_subscriptions", subDoc.id));
            } else {
              console.error("Error sending push to subscription:", err);
            }
          }
        });

        await Promise.allSettled(sendPromises);
      } catch (pushErr) {
        console.error("Error broadcasting push notifications:", pushErr);
      }
    }

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error("Failed to submit NGL message:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menyimpan pesan." },
      { status: 500 }
    );
  }
}
