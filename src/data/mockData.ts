export type Severity = 'حرج' | 'عالي' | 'متوسط'
export type NeedType = 'طبي' | 'معدات/إطفاء' | 'إجلاء'

export type ReliefRequest = {
 id: number
 name: string
 phone: string
 needType: NeedType
 severity: Severity
 locationDescription: string
 lat: number
 lng: number
 timestamp: string
}

export const mockRequests: ReliefRequest[] = [
 {
 id: 1,
 name: 'يوسف بن علي',
 phone: '0550000001',
 needType: 'طبي',
 severity: 'حرج',
 locationDescription: 'حي لبعاطشة، جيجل',
 lat: 36.8214,
 lng: 5.7662,
 timestamp: 'قبل 5 دقائق',
 },
 {
 id: 2,
 name: 'سارة عبد القادر',
 phone: '0550000002',
 needType: 'معدات/إطفاء',
 severity: 'عالي',
 locationDescription: 'قرب ميناء بجاية، بجاية',
 lat: 36.7515,
 lng: 5.0567,
 timestamp: 'قبل 12 دقيقة',
 },
 {
 id: 3,
 name: 'محمد أمين',
 phone: '0550000003',
 needType: 'إجلاء',
 severity: 'متوسط',
 locationDescription: 'أعالي الطاهير، جيجل',
 lat: 36.7667,
 lng: 5.9167,
 timestamp: 'قبل 20 دقيقة',
 },
]
