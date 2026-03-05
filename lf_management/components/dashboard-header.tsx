import { Package, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardHeader() {
  const stats = [
    {
      label: 'Total Items',
      value: '24',
      icon: Package,
      color: 'text-amber-800',
      bgColor: 'bg-amber-800/10'
    },
    {
      label: 'AI Matches Found',
      value: '8',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-700/10'
    },
    {
      label: 'Expiring Soon',
      value: '3',
      icon: AlertCircle,
      color: 'text-orange-700',
      bgColor: 'bg-orange-700/10'
    },
    {
      label: 'Claimed',
      value: '12',
      icon: Clock,
      color: 'text-stone-600',
      bgColor: 'bg-stone-600/10'
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="flex">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={stat.label}
                className={`flex-1 flex items-center gap-4 p-6 ${index !== stats.length - 1 ? 'border-r border-border' : ''}`}
              >
                <div className={`rounded-lg p-3 ${stat.bgColor} flex-shrink-0`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
