import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { clientDb } from "./firebase-client";

export interface ProgramCommentReply {
  content: string;
  createdAt: any;
}

export interface ProgramComment {
  id?: string;
  programId: string;
  authorName: string;
  content: string;
  createdAt: any;
  reply?: ProgramCommentReply | null;
}

export const addProgramComment = async (
  programId: string,
  content: string,
  authorName?: string
) => {
  try {
    const docRef = await addDoc(collection(clientDb, "program_comments"), {
      programId,
      authorName: authorName?.trim() || "Anonim",
      content: content.trim(),
      createdAt: serverTimestamp(),
      reply: null,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding program comment:", error);
    throw error;
  }
};

export const replyProgramComment = async (
  commentId: string,
  replyContent: string
) => {
  try {
    const docRef = doc(clientDb, "program_comments", commentId);
    await updateDoc(docRef, {
      reply: {
        content: replyContent.trim(),
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    throw error;
  }
};

export const deleteProgramComment = async (commentId: string) => {
  try {
    const docRef = doc(clientDb, "program_comments", commentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

export const deleteAdminReply = async (commentId: string) => {
  try {
    const docRef = doc(clientDb, "program_comments", commentId);
    await updateDoc(docRef, {
      reply: null,
    });
  } catch (error) {
    console.error("Error deleting admin reply:", error);
    throw error;
  }
};
