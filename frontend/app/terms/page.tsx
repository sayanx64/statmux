import Link from 'next/link'
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — statmux',
  description: 'Terms of Service and data usage policy for statmux developer analytics.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b0d10] shadow-sm border border-[#242933] overflow-hidden shrink-0">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="36" height="36" aria-hidden="true">
                <rect x="6" y="6" width="188" height="188" rx="42" fill="#0b0d10" stroke="#242933" strokeWidth="2"/>
                <rect x="24" y="24" width="70" height="152" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
                <rect x="106" y="24" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
                <rect x="106" y="108" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
                <circle cx="34" cy="36" r="4" fill="#34d399"/>
                <circle cx="116" cy="36" r="4" fill="#60a5fa"/>
                <circle cx="116" cy="120" r="4" fill="#fbbf24"/>
                <text x="59" y="116" fontFamily="'JetBrains Mono','Fira Code',monospace" fontSize="46" fontWeight="700" fill="#34d399" textAnchor="middle">&gt;_</text>
                <rect x="120" y="70" width="6" height="12" fill="#60a5fa"/>
                <rect x="131" y="62" width="6" height="20" fill="#60a5fa"/>
                <rect x="142" y="54" width="6" height="28" fill="#60a5fa"/>
                <rect x="153" y="66" width="6" height="16" fill="#60a5fa"/>
                <rect x="164" y="58" width="6" height="24" fill="#60a5fa"/>
                <polyline points="120,158 132,150 143,154 154,140 165,146" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight text-foreground">statmux</span>
              <span className="mt-1 text-[11px] font-medium text-muted-foreground">Legal &amp; Policy</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign in
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <FileText className="h-3.5 w-3.5" />
            Terms of Service
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Terms of Service &amp; Usage Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: <span className="font-mono text-foreground">August 2026</span> &bull; Effective immediately upon account creation or use of <strong className="text-foreground">statmux</strong>.
          </p>
        </div>

        {/* Highlight Callout */}
        <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <Shield className="mt-1 h-6 w-6 text-primary shrink-0" />
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-foreground">Summary for Developers</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                statmux aggregates publicly available coding activity and competitive programming performance metrics across platforms (GitHub, Codeforces, LeetCode). We do not sell your personal data, request private repository write access, or store credentials for third-party platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">1</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or creating an account on <strong className="text-foreground">statmux</strong> (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must discontinue use of the Service immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">2</span>
              Description of Service
            </h2>
            <p>
              statmux provides a unified analytics dashboard that ingests, calculates historical snapshots for, and visualizes developer activity metrics from multiple external platforms, including:
            </p>
            <ul className="grid gap-2 sm:grid-cols-3 pt-2">
              <li className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span className="font-medium text-foreground">GitHub (Public Activity)</span>
              </li>
              <li className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-info shrink-0" />
                <span className="font-medium text-foreground">Codeforces (Contest Ratings)</span>
              </li>
              <li className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="h-4 w-4 text-warning shrink-0" />
                <span className="font-medium text-foreground">LeetCode (Problem Solves)</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">3</span>
              Third-Party Data &amp; Rate Limits
            </h2>
            <p>
              statmux queries publicly accessible endpoints and APIs provided by third parties. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You only provide usernames/handles that you own or have permission to monitor.</li>
              <li>Data accuracy and availability depend entirely on upstream services (GitHub, Codeforces, LeetCode). We do not guarantee continuous or error-free access to upstream APIs.</li>
              <li>Automated refreshing and synchronization are subject to fair-use rate limiting to prevent upstream API bans or throttling.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">4</span>
              User Accounts &amp; Security
            </h2>
            <p>
              When you create an account via email or OAuth, you are responsible for maintaining the confidentiality of your credentials and account access. You agree to notify us promptly of any unauthorized use or security breach.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">5</span>
              Privacy &amp; Data Storage
            </h2>
            <p>
              We collect and store your email address, linked platform usernames, and periodic statistical snapshots (e.g. commit counts, rating points, problem counts) to construct your historical growth graphs. We do not sell your personal information or track your browsing activity outside the scope of the dashboard.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">6</span>
              Limitation of Liability
            </h2>
            <p>
              The Service is provided on an <strong className="text-foreground">&ldquo;AS IS&rdquo;</strong> and <strong className="text-foreground">&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind. Under no circumstances will statmux or its contributors be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the Service.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">7</span>
              Modifications &amp; Contact
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Service after any such changes constitutes your acceptance of the updated terms.
            </p>
            <p className="pt-2">
              For questions regarding these Terms or to request deletion of your account and data, contact{' '}
              <a href="mailto:statmux@sayan.cyou" className="text-primary hover:underline font-mono">
                statmux@sayan.cyou
              </a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} statmux. All rights reserved. &bull; unified coding analytics, multiplexed.</p>
        </footer>
      </main>
    </div>
  )
}
