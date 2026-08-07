import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { clientDb } from "./firebase-client";
import { uploadImageAction, deleteImageAction } from "./actions/upload";
import imageCompression from 'browser-image-compression';

export interface Meeting {
  id?: string;
  title: string;
  date: string;
  minutes: string;
  meetingImageUrl?: string;
  attendanceImageUrl?: string;
  createdAt: Timestamp | Date;
}

export const uploadMeetingImage = async (file: File): Promise<string> => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    
    const compressedFile = await imageCompression(file, options);
    
    const formData = new FormData();
    formData.append("file", compressedFile, file.name);
    
    return await uploadImageAction(formData);
  } catch (error) {
    console.error("Compression/Upload error:", error);
    throw new Error("Gagal mengkompres atau mengupload gambar.");
  }
};

export const addMeeting = async (
  data: Omit<Meeting, "id" | "createdAt">
) => {
  try {
    const docRef = await addDoc(collection(clientDb, "meetings"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateMeeting = async (
  id: string,
  data: Partial<Omit<Meeting, "id" | "createdAt">>
) => {
  try {
    const docRef = doc(clientDb, "meetings", id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const deleteMeeting = async (id: string, meetingImageUrl?: string, attendanceImageUrl?: string) => {
  try {
    if (meetingImageUrl) {
      await deleteImageAction(meetingImageUrl);
    }
    if (attendanceImageUrl) {
      await deleteImageAction(attendanceImageUrl);
    }
    
    const docRef = doc(clientDb, "meetings", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};
