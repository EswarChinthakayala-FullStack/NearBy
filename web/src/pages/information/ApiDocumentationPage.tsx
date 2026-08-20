import React, { useState } from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'
import { Icon } from '@/components/common/Icon'

export const ApiDocumentationPage: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'curl' | 'ts' | 'python'>('curl')

  const breadcrumbs = [
    { label: 'Developer Hub', href: '/docs/api' },
    { label: 'REST & Vector API Specification' },
  ]

  const tocItems = [
    { id: 'auth', title: 'Authentication & API Keys' },
    { id: 'search-endpoint', title: 'POST /v1/search/vector' },
    { id: 'code-examples', title: 'Code Examples & SDK' },
    { id: 'rate-limits', title: 'Rate Limits & Pagination' },
    { id: 'errors', title: 'Error Response Format' },
    { id: 'faq', title: 'Developer FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'System Status Dashboard',
      description: 'Check real-time API endpoint uptime and latency metrics.',
      href: '/system-status',
      iconName: 'grid' as const,
    },
    {
      title: 'Location Security',
      description: 'Review API telemetry encryption and token hashing.',
      href: '/location-security',
      iconName: 'shield' as const,
    },
  ]

  const faqItems = [
    {
      question: 'Where do I generate my Enterprise API key?',
      answer: 'API keys are provisioned inside the Nearby Developer Dashboard under Organization Settings > API Tokens.',
    },
    {
      question: 'What is the default rate limit for REST API endpoints?',
      answer: 'Standard Developer tier allows 600 requests/minute. Enterprise SLA tiers support up to 50,000 requests/minute with custom dedicated clusters.',
    },
  ]

  const codeSnippets = {
    curl: `curl -X POST "https://api.nearby.ai/v1/search/vector" \\
  -H "Authorization: Bearer nb_live_9f8a3b2c1d0e" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "quiet sunset beach spots near Panaji",
    "latitude": 15.498,
    "longitude": 73.834,
    "radius_km": 15,
    "max_results": 5
  }'`,
    ts: `import { NearbyClient } from '@nearby/sdk';

const client = new NearbyClient({
  apiKey: process.env.NEARBY_API_KEY,
});

const response = await client.search.vector({
  query: "quiet sunset beach spots near Panaji",
  latitude: 15.498,
  longitude: 73.834,
  radiusKm: 15,
  maxResults: 5,
});

console.log(response.places);`,
    python: `from nearby import NearbyClient
import os

client = NearbyClient(api_key=os.environ.get("NEARBY_API_KEY"))

response = client.search.vector(
    query="quiet sunset beach spots near Panaji",
    latitude=15.498,
    longitude=73.834,
    radius_km=15,
    max_results=5
)

for place in response.places:
    print(place.name, place.rating)`,
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <InformationLayout
      hero={{
        title: 'Developer REST & Vector API Specs',
        description: 'Integrate Nearby\'s semantic travel search, real-time GIS radar, and itinerary planning APIs directly into your software applications.',
        category: 'Developer Platform',
        iconName: 'settings',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Enterprise API',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Authentication */}
      <SectionCard id="auth" title="Authentication & API Keys" iconName="shield" badgeText="Bearer Token">
        <p className="text-xs text-muted-foreground leading-relaxed">
          All API requests to Nearby endpoints must include an <code className="font-mono text-primary bg-muted px-1.5 py-0.5 rounded-sm">Authorization: Bearer YOUR_API_KEY</code> header. Requests without valid bearer credentials return a <code className="font-mono text-rose-400">401 Unauthorized</code> response.
        </p>

        <CalloutBox type="security" title="API Key Security">
          Never expose secret live keys (<code className="font-mono">nb_live_...</code>) in client-side frontend code or public GitHub repositories. Use server-side proxy routes or restricted publishable keys.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: POST /v1/search/vector */}
      <SectionCard id="search-endpoint" title="POST /v1/search/vector" iconName="sparkles" badgeText="Vector Search">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Executes a high-dimensional vector search combining natural language query semantics with spatial coordinates.
        </p>

        <div className="space-y-2 my-2 font-mono text-xs">
          <div className="p-3 rounded-sm border border-border/60 bg-zinc-950 text-zinc-200 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400">POST</span>
              <span className="text-zinc-400">https://api.nearby.ai/v1/search/vector</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Code Examples */}
      <SectionCard id="code-examples" title="Code Examples & SDK Snippets" iconName="settings" badgeText="Multi-Language">
        {/* Code Tabs */}
        <div className="rounded-sm border border-border/80 bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-2">
            <div className="flex items-center gap-2">
              {(['curl', 'ts', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`rounded-sm px-3 py-1 font-mono text-xs font-bold uppercase transition-all ${
                    activeTab === lang
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {lang === 'ts' ? 'TypeScript' : lang}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Icon name={copied ? 'check' : 'bookmark'} size="xs" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
        </div>
      </SectionCard>

      {/* Section 4: Rate Limits */}
      <SectionCard id="rate-limits" title="Rate Limits & Pagination" iconName="clock" badgeText="HTTP Headers">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Rate limits are enforced per API key. Every HTTP response contains standard rate-limiting headers:
        </p>

        <div className="space-y-2 my-2 font-mono text-xs">
          <div className="p-3 rounded-sm border border-border/60 bg-card/60 space-y-1">
            <p><span className="text-primary font-bold">X-RateLimit-Limit:</span> 600</p>
            <p><span className="text-amber-400 font-bold">X-RateLimit-Remaining:</span> 598</p>
            <p><span className="text-emerald-400 font-bold">X-RateLimit-Reset:</span> 1722000000</p>
          </div>
        </div>
      </SectionCard>

      {/* Section 5: Error Response Format */}
      <SectionCard id="errors" title="Error Response Format" iconName="error" badgeText="JSON Schema">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Errors return standard RFC 7807 Problem Details envelopes:
        </p>

        <pre className="p-4 rounded-sm border border-border/80 bg-zinc-950 font-mono text-xs text-rose-300 overflow-x-auto">
{`{
  "type": "https://api.nearby.ai/errors/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Quota of 600 requests per minute exceeded. Retry after 14 seconds.",
  "instance": "/v1/search/vector"
}`}
        </pre>
      </SectionCard>

      {/* Section 6: FAQ */}
      <SectionCard id="faq" title="Developer FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default ApiDocumentationPage
