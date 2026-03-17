import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"

import Hero from "@/components/Hero"
import Features from "@/components/Features"
import CTA from "@/components/CTA"

import { ArrowRight, BadgeCheck, Gem, Sparkles, Sword, Shield } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const user = await getSessionUser()

  // Redirect logged-in users
  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="bg-black text-white">
      
      {/* 🔥 HERO (New Modern Section) */}
      <Hero />

      {/* 🔥 PREMIUM PREVIEW SECTION */}
      <section className="container-shell grid gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        
        {/* LEFT CONTENT */}
        <div>
          <div className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm accent-text">
            Startup-grade Minecraft progression intelligence
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl">
            Transform your survival run into a{" "}
            <span className="bg-linear-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              beautiful progression platform
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Track milestones, unlock achievements, get smart guidance, and manage your world like a premium SaaS dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-600 transition"
            >
              Launch your dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 hover:bg-white/10 transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="glass gradient-border rounded-4xl p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Adaptive progression", icon: Sparkles },
              { label: "Cross-device sync", icon: BadgeCheck },
              { label: "Achievement system", icon: Sword },
              { label: "Premium theming", icon: Gem },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft accent-text">
                  <item.icon className="h-5 w-5" />
                </div>

                <div className="mt-4 text-lg font-semibold">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔥 FEATURES (Clean Section) */}
      <Features />

      {/* 🔥 EXTRA FEATURE CARDS */}
      <section className="container-shell pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Personalized dashboard",
              description:
                "Track XP, levels, stages, smart recommendations, and tasks in one command center.",
            },
            {
              title: "Secure full-stack auth",
              description:
                "JWT auth, protected routes, validation, cookies, and server-backed sessions.",
            },
            {
              title: "World-aware themes",
              description:
                "Switch between Overworld, Nether, and End themes with a premium UI.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass gradient-border rounded-4xl p-6 hover:scale-[1.02] transition"
            >
              <Shield className="h-6 w-6 accent-text" />

              <h2 className="mt-5 text-2xl font-semibold">
                {feature.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 CTA */}
      <CTA />
    </main>
  )
}