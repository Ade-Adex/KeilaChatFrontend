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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-[10px] font-semibold uppercase tracking-widest mb-6">
          <FiZap className="text-[#0070f3]" /> Real-time messaging engine
        </div>
        <h1 className="text-3xl md:text-6xl font-extrabold mb-8 tracking-tighter">
          Connect with your <br /> customers{' '}
          <span className="text-[#0070f3]">instantly</span>.
        </h1>
        <p className="text-sm md:text-lg opacity-90 max-w-2xl mx-auto mb-10">
          Keila provides a robust, multi-tenant architecture for real-time
          engagement. Deploy a professional-grade chat terminal on your property
          in seconds.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/chat-test/embed/chat?propertyId=b9a5cea7-ec8b-4cb6-9c62-521e5fd8f195"
            className="px-8 py-4 bg-[#0070f3] hover:bg-[#0060e3] text-white rounded-xl font-bold transition-all shadow-xl shadow-[#0070f3]/20 flex items-center gap-2 text-sm"
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
            className="p-8 rounded-2xl bg-foreground/3 border border-foreground/5"
          >
            <feature.icon className="text-[#0070f3] w-8 h-8 mb-4" />
            <h3 className="font-bold text-base md:text-lg mb-2">{feature.title}</h3>
            <p className="opacity-80 text-xs md:text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
