import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

// Define collection names
const REQUESTS_COLLECTION = 'requests'
const VOLUNTEERS_COLLECTION = 'volunteers'

/**
 * Submit a new relief request from a victim
 */
export async function submitReliefRequest(data: any) {
  try {
    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), {
      ...data,
      status: 'pending', // pending, assigned, completed
      createdAt: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding document: ", error)
    return { success: false, error }
  }
}

/**
 * Register a new volunteer convoy
 */
export async function registerVolunteer(data: any) {
  try {
    const docRef = await addDoc(collection(db, VOLUNTEERS_COLLECTION), {
      ...data,
      status: 'active',
      createdAt: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding document: ", error)
    return { success: false, error }
  }
}

/**
 * Hook logic (to be used in components) for optimized fetching
 * Never listen to the entire collection!
 */
export function listenToActiveRequests(wilayaCode: number | null, callback: (data: any[]) => void) {
  let q = query(
    collection(db, REQUESTS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(50)
  )

  // If a wilaya is specified, filter by it to reduce reads
  if (wilayaCode) {
    q = query(
      collection(db, REQUESTS_COLLECTION),
      where('status', '==', 'pending'),
      where('wilayaCode', '==', wilayaCode),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(requests)
  })

  return unsubscribe
}
