import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { clientDb } from "./firebase-client";
import { uploadImageAction, deleteImageAction } from "./actions/upload";

export type TransactionType = "income" | "expense" | "base_cash";

export interface FinanceTransaction {
  id?: string;
  type: TransactionType;
  title: string;
  amount: number;
  quantity?: number;
  description?: string;
  imageUrl?: string;
  createdAt: Timestamp | Date;
}

import imageCompression from 'browser-image-compression';

export const uploadFinanceImage = async (file: File): Promise<string> => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    
    const compressedFile = await imageCompression(file, options);
    
    const formData = new FormData();
    formData.append("file", compressedFile, file.name);
    
    // Call the Next.js Server Action
    return await uploadImageAction(formData);
  } catch (error) {
    console.error("Compression/Upload error:", error);
    throw new Error("Gagal mengkompres atau mengupload gambar.");
  }
};

export const addFinanceTransaction = async (
  data: Omit<FinanceTransaction, "id" | "createdAt">
) => {
  try {
    const docRef = await addDoc(collection(clientDb, "finance_transactions"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateFinanceTransaction = async (
  id: string,
  data: Partial<Omit<FinanceTransaction, "id" | "createdAt" | "type">>
) => {
  try {
    const docRef = doc(clientDb, "finance_transactions", id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const deleteFinanceTransaction = async (id: string, imageUrl?: string) => {
  try {
    // Delete image from Cloudinary if it exists
    if (imageUrl) {
      await deleteImageAction(imageUrl);
    }
    
    const docRef = doc(clientDb, "finance_transactions", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};
