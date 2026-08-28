import { useState } from 'react'
import VolunteerForm from '../components/VolunteerForm'
import MissionAssignment from '../components/MissionAssignment'
import { mockRequests } from '../data/mockData'
import type { ReliefRequest } from '../data/mockData'
import type { VolunteerFormState } from '../components/VolunteerForm'
import { registerVolunteer } from '../firebase/firestore'

export default function Volunteer() {
 const [volunteerData, setVolunteerData] = useState<VolunteerFormState | null>(null)
 const [assignedMission, setAssignedMission] = useState<ReliefRequest | null>(null)

 const handleFormSubmit = async (data: VolunteerFormState) => {
 setVolunteerData(data)
 
 // Save to Firestore
 await registerVolunteer(data)

 // SIMULATE AI MATCHMAKING
 // Filter by resource type if possible, or just pick the most critical one.
 // Let's simplify: 
 // - Human (Medical) -> NeedType 'طبي'
 // - Material -> NeedType 'إجلاء' (or anything)
 // - Logistic -> NeedType 'معدات/إطفاء'
 let targetNeed = ''
 if (data.category.includes('بشرية')) targetNeed = 'طبي'
 else if (data.category.includes('لوجستية')) targetNeed = 'معدات/إطفاء'
 else targetNeed = 'إجلاء'

 const match = mockRequests.find(req => req.needType === targetNeed) || mockRequests[0]
 
 setTimeout(() => {
 setAssignedMission(match)
 }, 800) // fake processing delay
 }

 const handleAccept = () => {
 alert('تم قبول المهمة! سيتم توجيهك الآن عبر GPS وسيتم إخطار المتضررين بقدومك.')
 setVolunteerData(null)
 setAssignedMission(null)
 }

 return (
 <div className="mx-auto max-w-2xl">
 {volunteerData && assignedMission && volunteerData.lat && volunteerData.lng ? (
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
