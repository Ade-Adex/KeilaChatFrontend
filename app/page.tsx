import ChatWidget from '@/app/components/ChatWidget'
import Link from 'next/link'
import {
  FiMessageSquare,
  FiZap,
  FiShield,
  FiGlobe,
  FiCheckCircle,
} from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 py-32">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 text-center mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-primary text-[10px] font-semibold uppercase tracking-widest mb-6">
          <FiZap className="text-primary" /> Real-time messaging engine
        </div>
        <h1 className="text-3xl md:text-6xl font-extrabold mb-8 tracking-tighter">
          Connect with your <br /> customers{' '}
          <span className="text-primary">instantly</span>.
        </h1>
        <p className="text-sm md:text-lg opacity-90 max-w-2xl mx-auto mb-10">
          Keila provides a robust, multi-tenant architecture for real-time
          engagement. Deploy a professional-grade chat terminal on your property
          in seconds.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/chat-test/embed/chat?propertyId=7e5884eb-1166-4230-a3d4-6d7620873b96"
            className="px-8 py-4 bg-primary hover:bg-button-hover text-white rounded-xl font-bold transition-all shadow-xl shadow-[#0070f3]/20 flex items-center gap-2 text-sm"
          >
            Start Live Chat <FiMessageSquare />
          </Link>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {[
          {
            icon: FiShield,
            title: 'Secure & Encrypted',
            desc: 'Enterprise-grade AES-256 encryption for every message.',
          },
          {
            icon: FiGlobe,
            title: 'Multi-Tenant',
            desc: 'Manage multiple properties from a single control node.',
          },
          {
            icon: FiCheckCircle,
            title: 'Instant Status',
            desc: 'Live monitoring with sub-20ms message latency.',
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="group p-8 rounded-2xl bg-card border border-border transition-all duration-300 hover:border-primary hover:shadow-lg"
          >
            <feature.icon className="text-primary w-8 h-8 mb-4 transition-transform duration-300 group-hover:scale-110" />

            <h3 className="font-bold text-base md:text-lg mb-2 text-foreground">
              {feature.title}
            </h3>

            <p className="opacity-80 text-xs md:text-sm group-hover:opacity-100 transition-opacity">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      <ChatWidget widgetId="7e5884eb-1166-4230-a3d4-6d7620873b96" />
    </div>
  )
}
