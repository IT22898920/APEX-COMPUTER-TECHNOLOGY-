import { Shield, Truck, Clock, Award, Headphones, BadgeCheck, CreditCard, RotateCcw } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Genuine Products',
    description: 'All products are 100% genuine with manufacturer warranty',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick delivery across Sri Lanka within 2-3 business days',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clock,
    title: '2-3hr Response',
    description: 'Guaranteed response time for all support requests',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Dedicated technical support from certified professionals',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: BadgeCheck,
    title: '10+ Years Experience',
    description: 'Trusted IT partner for businesses across Sri Lanka',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Multiple payment options including installment plans',
    color: 'from-indigo-500 to-blue-500',
  },
]

const brands = [
  'HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'Canon', 'Epson', 'Brother',
  'TP-Link', 'D-Link', 'Logitech', 'Samsung', 'LG', 'Kingston', 'WD'
]

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[1200px] rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-[100px]" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 px-4 sm:px-0">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Award className="mr-2 h-4 w-4" />
            Why Choose Us
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-4">
            Your Trusted IT Partner
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We&apos;ve been serving businesses with quality IT products and exceptional service for over a decade
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 sm:p-8 rounded-2xl bg-card border border-primary/10 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                <feature.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trusted Brands */}
        <div className="px-4 sm:px-0">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Authorized Dealer For
            </p>
          </div>

          {/* Brand logos marquee */}
          <div className="relative overflow-hidden py-4">
            <div className="flex animate-marquee space-x-12">
              {[...brands, ...brands].map((brand, index) => (
                <div
                  key={`${brand}-${index}`}
                  className="flex-shrink-0 px-6 py-3 rounded-lg bg-muted/50 border border-primary/5 hover:border-primary/20 transition-colors"
                >
                  <span className="text-lg font-bold text-muted-foreground/70 hover:text-foreground transition-colors whitespace-nowrap">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-10 px-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">SSL Secure</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BadgeCheck className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Verified Seller</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <RotateCcw className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">Easy Returns</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Island-wide Delivery</span>
          </div>
        </div>
      </div>
    </section>
  )
}
