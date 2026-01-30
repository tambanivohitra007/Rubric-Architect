import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db } from '../config/firebase';
import { RubricData } from '../types';

const RUBRICS_COLLECTION = 'rubrics';

// Convert Firestore timestamps to Date objects
function convertTimestamps(data: any): RubricData {
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
  };
}

// Prepare data for Firestore (remove undefined values and handle timestamps)
function prepareForFirestore(data: Record<string, any>): Record<string, any> {
  const prepared: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      prepared[key] = value;
    }
  }
  return prepared;
}

export async function createRubric(
  rubricData: RubricData,
  userId: string
): Promise<string> {
  // Prepare rubric data without the timestamp fields first
  const { id, createdAt, updatedAt, ...rubricWithoutMeta } = rubricData as any;

  const dataToSave = prepareForFirestore({
    ...rubricWithoutMeta,
    userId,
    isPublic: false,
    shareId: null,
  });

  // Add timestamps separately using serverTimestamp
  dataToSave.createdAt = serverTimestamp();
  dataToSave.updatedAt = serverTimestamp();

  const docRef = await addDoc(collection(db, RUBRICS_COLLECTION), dataToSave);
  return docRef.id;
}

export async function updateRubric(
  rubricId: string,
  rubricData: Partial<RubricData>
): Promise<void> {
  const docRef = doc(db, RUBRICS_COLLECTION, rubricId);

  // Remove fields that shouldn't be updated
  const { userId, createdAt, id, updatedAt, ...updateFields } = rubricData as any;

  const dataToUpdate = prepareForFirestore(updateFields);

  // Add updated timestamp
  dataToUpdate.updatedAt = serverTimestamp();

  await updateDoc(docRef, dataToUpdate);
}

export async function deleteRubric(rubricId: string): Promise<void> {
  const docRef = doc(db, RUBRICS_COLLECTION, rubricId);
  await deleteDoc(docRef);
}

export async function getRubricById(rubricId: string): Promise<RubricData | null> {
  const docRef = doc(db, RUBRICS_COLLECTION, rubricId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertTimestamps({
      id: docSnap.id,
      ...docSnap.data(),
    });
  }

  return null;
}

export async function getRubricsByUserId(userId: string): Promise<RubricData[]> {
  const q = query(
    collection(db, RUBRICS_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const rubrics: RubricData[] = [];

  querySnapshot.forEach((doc) => {
    rubrics.push(
      convertTimestamps({
        id: doc.id,
        ...doc.data(),
      })
    );
  });

  return rubrics;
}

export async function getRubricByShareId(shareId: string): Promise<RubricData | null> {
  const q = query(
    collection(db, RUBRICS_COLLECTION),
    where('shareId', '==', shareId),
    where('isPublic', '==', true)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnapshot = querySnapshot.docs[0];
  return convertTimestamps({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  });
}

export async function enableSharing(rubricId: string): Promise<string> {
  const docRef = doc(db, RUBRICS_COLLECTION, rubricId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Rubric not found');
  }

  const data = docSnap.data();

  // If already has a shareId, return it
  if (data.shareId && data.isPublic) {
    return data.shareId;
  }

  // Generate new shareId if needed
  const shareId = data.shareId || nanoid(10);

  await updateDoc(docRef, {
    isPublic: true,
    shareId,
    updatedAt: serverTimestamp(),
  });

  return shareId;
}

export async function disableSharing(rubricId: string): Promise<void> {
  const docRef = doc(db, RUBRICS_COLLECTION, rubricId);

  await updateDoc(docRef, {
    isPublic: false,
    updatedAt: serverTimestamp(),
  });
}

export async function duplicateRubric(rubricId: string, userId: string): Promise<string> {
  const original = await getRubricById(rubricId);

  if (!original) {
    throw new Error('Rubric not found');
  }

  // Create a copy with modified title
  const { id, createdAt, updatedAt, shareId, isPublic, ...rubricData } = original as any;

  const duplicateData = prepareForFirestore({
    ...rubricData,
    topic: `${original.topic} (Copy)`,
    userId,
    isPublic: false,
    shareId: null,
  });

  duplicateData.createdAt = serverTimestamp();
  duplicateData.updatedAt = serverTimestamp();

  const docRef = await addDoc(collection(db, RUBRICS_COLLECTION), duplicateData);
  return docRef.id;
}
