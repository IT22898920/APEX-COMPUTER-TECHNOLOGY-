 import Link from 'next/link'
import { Check, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AGREEMENT_TYPES } from '@/lib/utils/constants'

const plans = [
  {
    key: 'on_call' as const,
    price: 'Pay per service',
    popular: false,
  },
  {
    key: 'labour_only' as const,
    price: 'From Rs. 15,000/mo',
    popular: false,
  },
  {
    key: 'comprehensive' as const,
    price: 'From Rs. 35,000/mo',
    popular: true,
  },
]

export function AgreementsSection() {
  return (
    <section className="py-12 sm:py-20 md:py-28 bg-gradient-to-b from-primary/5 via-muted/50 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16 px-4 sm:px-0">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Pricing Plans
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-4">
            Service Agreement Plans
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Choose the plan that fits your business needs. All plans include our SLA guarantee.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-5xl mx-auto px-4 sm:px-0">
          {plans.map(({ key, price, popular }) => {
            const plan = AGREEMENT_TYPES[key]
            return (
              <Card
                key={key}
                className={`relative group transition-all duration-300 hover:-translate-y-2 ${
                  popular
                    ? 'border-primary shadow-xl shadow-primary/10 md:scale-105 bg-gradient-to-b from-primary/5 to-background'
                    : 'border-primary/10 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5'
                }`}
              >
                {popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary shadow-lg shadow-primary/25 px-4">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4 pt-8">
                  <CardTitle className="text-2xl">{plan.label}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{price}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    className={`w-full transition-all duration-300 ${
                      popular
                        ? 'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                        : ''
                    }`}
                    variant={popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/contact">Get Quote</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
