import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { clientDb } from "./firebase-client";
import { uploadImageAction, deleteImageAction } from "./actions/upload";
import imageCompression from 'browser-image-compression';

export interface Program {
  id?: string;
  title: string;
  date: string;
  category: string;
  description: string;
  imageUrls: string[];
  createdAt: Timestamp | Date;
}

export const uploadMultipleProgramImages = async (files: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append("file", compressedFile, file.name);
      
      const url = await uploadImageAction(formData);
      uploadedUrls.push(url);
    } catch (error) {
      console.error("Compression/Upload error for file:", file.name, error);
      // We continue to try uploading other files even if one fails
    }
  }
  
  return uploadedUrls;
};

export const addProgram = async (
  data: Omit<Program, "id" | "createdAt">
) => {
  try {
    const docRef = await addDoc(collection(clientDb, "programs"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const updateProgram = async (
  id: string,
  data: Partial<Omit<Program, "id" | "createdAt">>
) => {
  try {
    const docRef = doc(clientDb, "programs", id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

export const deleteProgram = async (id: string, imageUrls: string[]) => {
  try {
    // Delete all images from Cloudinary
    for (const url of imageUrls) {
      if (url) {
        try {
          await deleteImageAction(url);
        } catch (e) {
          console.error("Failed to delete image:", url, e);
        }
      }
    }
    
    const docRef = doc(clientDb, "programs", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};
