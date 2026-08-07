import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { clientDb } from "./firebase-client";

export type EventStatus = "Direncanakan" | "Dilaksanakan" | "Selesai";

export interface AgendaEvent {
  id?: string;
  title: string;
  date: string;
  time: string;
  status: EventStatus;
  createdAt?: any;
}

const COLLECTION_NAME = "events";

export const addEvent = async (eventData: Omit<AgendaEvent, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(clientDb, COLLECTION_NAME), {
      ...eventData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding event: ", error);
    throw error;
  }
};

export const updateEvent = async (id: string, eventData: Partial<Omit<AgendaEvent, "id" | "createdAt">>) => {
  try {
    const eventRef = doc(clientDb, COLLECTION_NAME, id);
    await updateDoc(eventRef, eventData);
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await deleteDoc(doc(clientDb, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};
