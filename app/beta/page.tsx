import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BetaFeature {
  title: string
  description: string
  href: string
}

const betaFeatures: BetaFeature[] = [
  {
    title: "TikTok-Style Quiz",
    description: "Try our new vertical scroll quiz experience with smooth animations and instant feedback.",
    href: "/beta/quiz"
  }
]

export default function BetaFeaturesPage() {
  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="size-5" />
        <h1 className="text-2xl font-bold tracking-tight">Beta Features</h1>
      </div>
      
      {betaFeatures.length === 0 ? (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>No Beta Features Available</CardTitle>
            <CardDescription>
              There are currently no beta features available for testing. Check back later!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {betaFeatures.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <Card className="h-full transition-colors hover:bg-muted/50 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {feature.title}
                    <ArrowRight className="size-4" />
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
