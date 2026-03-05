'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface Item {
  id: string
  name: string
  category: string
  description: string
  dateLogged: Date
  expirationDate: Date
  status: 'available' | 'matched' | 'claimed' | 'expiring'
  storageLocation: string
  matchedWith?: string
  imageUrl?: string
}

const mockItems: Item[] = [
  {
    id: '1',
    name: 'Black Leather Wallet',
    category: 'Accessories',
    description: 'Contains ID and credit cards',
    dateLogged: new Date('2025-02-15'),
    expirationDate: new Date('2025-05-15'),
    status: 'matched',
    storageLocation: 'Shelf A-2',
    matchedWith: 'John Doe',
    imageUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '2',
    name: 'Blue Backpack',
    category: 'Bags',
    description: 'School backpack with zipper',
    dateLogged: new Date('2025-02-20'),
    expirationDate: new Date('2025-05-20'),
    status: 'available',
    storageLocation: 'Cabinet B-1',
    imageUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '3',
    name: 'Stainless Steel Watch',
    category: 'Electronics',
    description: 'Silver watch with leather strap',
    dateLogged: new Date('2025-02-10'),
    expirationDate: new Date('2025-03-10'),
    status: 'expiring',
    storageLocation: 'Drawer C-3',
    imageUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '4',
    name: 'Car Keys',
    category: 'Keys',
    description: 'Silver car key with blue tag',
    dateLogged: new Date('2025-02-25'),
    expirationDate: new Date('2025-05-25'),
    status: 'available',
    storageLocation: 'Lockbox D-1',
    imageUrl: 'https://via.placeholder.com/40'
  },
  {
    id: '5',
    name: 'Prescription Glasses',
    category: 'Accessories',
    description: 'Round frame glasses in case',
    dateLogged: new Date('2025-02-18'),
    expirationDate: new Date('2025-05-18'),
    status: 'claimed',
    storageLocation: 'Shelf A-5',
    matchedWith: 'Sarah Smith',
    imageUrl: 'https://via.placeholder.com/40'
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'matched':
      return (
        <Badge className="gap-1 bg-accent text-accent-foreground">
          <CheckCircle2 className="h-3 w-3" />
          AI Match Found
        </Badge>
      )
    case 'claimed':
      return (
        <Badge variant="outline" className="gap-1 text-emerald-700 border-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Claimed
        </Badge>
      )
    case 'expiring':
      return (
        <Badge className="gap-1 bg-orange-700 text-white">
          <AlertCircle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      )
    case 'available':
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Available
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

export function ItemList() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="border-b border-border">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">Item</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date Logged</TableHead>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Storage Place</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockItems.map((item) => (
            <TableRow key={item.id} className="border-border hover:bg-muted/50">
              <TableCell className="py-3">
                <div className="h-8 w-8 rounded bg-muted"></div>
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
              <TableCell className="text-sm">{format(item.dateLogged, 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-sm">{format(item.expirationDate, 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-sm font-medium">{item.storageLocation}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
