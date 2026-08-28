import { useState } from 'react'
import VolunteerForm from '../components/VolunteerForm'
import MissionAssignment from '../components/MissionAssignment'
import { mockRequests } from '../data/mockData'
import type { ReliefRequest } from '../data/mockData'
import type { VolunteerFormState } from '../components/VolunteerForm'
import { registerVolunteer } from '../firebase/firestore'
import { Loader2 } from 'lucide-react'

export default function Volunteer() {
 const [volunteerData, setVolunteerData] = useState<VolunteerFormState | null>(null)
 const [assignedMission, setAssignedMission] = useState<ReliefRequest | null>(null)
 const [isProcessing, setIsProcessing] = useState(false)

 const handleFormSubmit = async (data: VolunteerFormState) => {
  setIsProcessing(true)
  
  try {
    // 1. Force server sync with a timeout (10 seconds)
    // We use Promise.race to prevent infinite hanging if Firestore database isn't initialized
    const syncPromise = registerVolunteer(data)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000))
    
    await Promise.race([syncPromise, timeoutPromise])
  } catch (error) {
    alert('تعذر الاتصال بالخوادم المركزية! يرجى التأكد من اتصالك بالإنترنت وتفعيل قاعدة البيانات.')
    setIsProcessing(false)
    return
  }

  // SIMPLIFIED MATCHMAKING:
  // For this version, just pick the highest severity request in the same wilaya (simulated)
  // We'll just grab the first available mock request to keep it extremely simple.
  const match = mockRequests[0]
  
  // Fake processing delay to simulate AI computing routes
  setTimeout(() => {
    setVolunteerData(data)
    setAssignedMission(match)
    setIsProcessing(false)
  }, 1500)
 }

 const handleAccept = () => {
  alert('تم قبول المهمة! سيتم توجيهك الآن عبر GPS وسيتم إخطار المتضررين بقدومك.')
  setVolunteerData(null)
  setAssignedMission(null)
 }

 return (
  <div className="mx-auto max-w-2xl">
   {isProcessing ? (
    <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-in fade-in">
      <Loader2 size={48} className="animate-spin text-emerald-500" />
      <h2 className="text-xl font-bold text-white">جاري تحليل البيانات...</h2>
      <p className="text-slate-400 text-center text-sm max-w-xs">
        يقوم الذكاء الاصطناعي الآن بمقاطعة موارد قافلتك مع أولوية النداءات الميدانية لرسم أفضل مسار...
      </p>
    </div>
   ) : volunteerData && assignedMission && volunteerData.lat && volunteerData.lng ? (
    <MissionAssignment 
     volunteerData={{ lat: volunteerData.lat, lng: volunteerData.lng, name: volunteerData.name }}
     mission={assignedMission}
     onAccept={handleAccept}
    />
   ) : (
    <VolunteerForm onSubmitForm={handleFormSubmit} />
   )}
  </div>
 )
}
