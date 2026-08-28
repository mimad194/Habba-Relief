export type CatalogItem = {
  id: string
  label: string
  unit: string
  defaultQty: number
}

export type CatalogCategory = {
  id: string
  label: string
  emoji: string
  items: CatalogItem[]
}

// Relief catalog adapted to Sphere/UN OCHA standards for wildfire emergencies
export const RELIEF_CATALOG: CatalogCategory[] = [
  {
    id: 'wash_food',
    label: 'الأمن الغذائي والمياه (Food & WASH)',
    emoji: '💧',
    items: [
      { id: 'f-water', label: 'مياه شرب صالحة (قارورات)', unit: 'لتر', defaultQty: 20 },
      { id: 'f-flour', label: 'دقيق / فرينة', unit: 'كيلوغرام', defaultQty: 25 },
      { id: 'f-oil', label: 'زيت طعام', unit: 'لتر', defaultQty: 5 },
      { id: 'f-canned', label: 'أغذية معلبة جاهزة للاستهلاك', unit: 'علبة', defaultQty: 24 },
      { id: 'f-dates', label: 'تمور (طاقة سريعة)', unit: 'كيلوغرام', defaultQty: 5 },
      { id: 'f-milk', label: 'حليب أطفال (بودرة)', unit: 'علبة', defaultQty: 2 },
      { id: 'f-diapers', label: 'حفاظات أطفال', unit: 'علبة', defaultQty: 2 },
    ]
  },
  {
    id: 'medical',
    label: 'الصحة والإسعافات (Health)',
    emoji: '⚕️',
    items: [
      { id: 'm-burn', label: 'مراهم وعلاجات حروق (Biafine الخ)', unit: 'أنبوب', defaultQty: 5 },
      { id: 'm-eyes', label: 'قطرات عيون (لتهيج الدخان)', unit: 'قطارة', defaultQty: 10 },
      { id: 'm-asthma', label: 'بخاخات ربو / أجهزة أكسجين محمولة', unit: 'وحدة', defaultQty: 2 },
      { id: 'm-bandages', label: 'شاش طبّي وضمادات معقمة', unit: 'علبة', defaultQty: 10 },
      { id: 'm-antiseptic', label: 'محاليل تعقيم (بيتادين، كحول)', unit: 'زجاجة', defaultQty: 5 },
      { id: 'm-masks', label: 'كمامات طبية للحماية من الدخان', unit: 'علبة (50)', defaultQty: 2 },
      { id: 'm-painkiller', label: 'مسكنات ألم وخافضات حرارة', unit: 'علبة', defaultQty: 10 },
      { id: 'm-firstaid', label: 'حقائب إسعاف أولي متكاملة', unit: 'حقيبة', defaultQty: 1 },
    ]
  },
  {
    id: 'nfi',
    label: 'مواد الإيواء غير الغذائية (NFI)',
    emoji: '⛺',
    items: [
      { id: 'n-tent', label: 'خيام إيواء للطوارئ', unit: 'خيمة', defaultQty: 1 },
      { id: 'n-blanket', label: 'بطانيات وأغطية مقاومة للبرد', unit: 'قطعة', defaultQty: 10 },
      { id: 'n-mattress', label: 'فرشات إسفنجية', unit: 'فرشة', defaultQty: 5 },
      { id: 'n-tarp', label: 'أغطية مشمعة (Tarpaulins)', unit: 'قطعة', defaultQty: 3 },
      { id: 'n-clothes', label: 'ملابس وحقائب ألبسة', unit: 'حزمة', defaultQty: 5 },
      { id: 'n-shoes', label: 'أحذية عملية', unit: 'زوج', defaultQty: 5 },
    ]
  },
  {
    id: 'logistics',
    label: 'اللوجستيات ومعدات الإطفاء (Logistics)',
    emoji: '🚒',
    items: [
      { id: 'l-watertank', label: 'صهريج مياه للإطفاء / الشرب', unit: 'صهريج', defaultQty: 1 },
      { id: 'l-chainsaw', label: 'مناشير آلية (لقطع مسارات النار)', unit: 'آلة', defaultQty: 1 },
      { id: 'l-generator', label: 'مولدات كهربائية', unit: 'وحدة', defaultQty: 1 },
      { id: 'l-pump', label: 'مضخات مياه محمولة', unit: 'مضخة', defaultQty: 1 },
      { id: 'l-lights', label: 'كاشفات ضوئية يدوية / ليلية', unit: 'كاشف', defaultQty: 5 },
      { id: 'l-ambulance', label: 'سيارات إسعاف مجهزة', unit: 'مركبة', defaultQty: 1 },
      { id: 'l-truck', label: 'شاحنات نقل / سيارات نفعية', unit: 'مركبة', defaultQty: 1 },
      { id: 'l-heavy', label: 'آليات ثقيلة (جرافات لإزالة الأنقاض)', unit: 'آلة', defaultQty: 1 },
    ]
  },
]

export const findCatalogItem = (itemId: string): CatalogItem | undefined => {
  for (const category of RELIEF_CATALOG) {
    const found = category.items.find(i => i.id === itemId)
    if (found) return found
  }
  return undefined
}

export type SelectedItem = {
  itemId: string
  qty: number
  customLabel?: string
}
