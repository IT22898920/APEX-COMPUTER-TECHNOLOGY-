import { getActiveServices } from '@/app/(dashboard)/admin/services/actions'
import { ServiceAnimationWrapper } from './services-animation-wrapper'

export async function ServicesSectionV2() {
  const { services } = await getActiveServices()

  // Use featured services first, then fill with other active services
  const featuredServices = services.filter(s => s.is_featured)
  const otherServices = services.filter(s => !s.is_featured)
  const displayServices = [...featuredServices, ...otherServices].slice(0, 6)

  if (displayServices.length === 0) return null

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-[#0a0a15] to-[#0f0f1a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="container relative z-10 px-4">
        <ServiceAnimationWrapper services={displayServices} />
      </div>
    </section>
  )
}
