export interface AIDescription {
  item: string
  color: string
  text: string
  confidence: number
  box?: [number, number, number, number]
}

export interface ItemLocation {
  lat: number
  lng: number
  address: string
}

export interface Item {
  id: string
  name: string
  category: string
  description: string
  dateLogged: Date
  expirationDate: Date
  status: 'available' | 'matched' | 'claimed' | 'expiring'
  storageLocation: string
  foundLocation?: ItemLocation
  matchedWith?: string
  imageUrl?: string
  aiDescription?: AIDescription
  createdAt?: Date
  updatedAt?: Date
}

export type ItemStatus = Item['status']

export interface ItemFormData {
  name: string
  category: string
  description: string
  dateLogged: Date
  storageLocation: string
  image?: File
}

export const ITEM_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Accessories',
  'Documents',
  'Keys',
  'Bags',
  'Sports Equipment',
  'Books',
  'Other',
] as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

export const STORAGE_LOCATIONS = [
  'Front Desk',
  'Security Office',
  'Storage Room A',
  'Storage Room B',
  'Warehouse',
] as const

export type StorageLocation = (typeof STORAGE_LOCATIONS)[number]
