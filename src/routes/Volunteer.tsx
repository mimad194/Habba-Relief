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
  let targetNeed: ReliefRequest['needType'] = 'إجلاء'
  
  if (data.inventory) {
    const hasMedical = data.inventory.some(item => item.id.startsWith('med-'))
    const hasLogistics = data.inventory.some(item => item.id.startsWith('log-'))
    
    if (hasMedical) targetNeed = 'طبي'
    else if (hasLogistics) targetNeed = 'معدات/إطفاء'
  }

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
