import { DashboardHeader } from "@/components/dashboard-header"
import { ItemList } from "@/components/item-list"
import { AddItemDialog } from "@/components/add-item-dialog"

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track and manage lost and found items</p>
        </div>
        <AddItemDialog />
      </div>

      <DashboardHeader />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Items</h2>
        </div>
        <ItemList />
      </div>
    </div>
  )
}
