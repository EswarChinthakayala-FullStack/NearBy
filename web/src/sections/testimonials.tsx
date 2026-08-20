import { Star, CheckCircle } from 'lucide-react'

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Keyless Search allowed us to build an image discovery engine without paying $2,000/mo in Bing API credits. The parallel scrapers and Redis deduplication work flawlessly.",
      author: "Alex Rivera",
      role: "Lead Architect at DataFlow Labs",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rating: 5,
    },
    {
      quote: "The per-source circuit breaker feature saved our pipeline when DuckDuckGo changed HTML signatures. Bing kept serving candidates seamlessly with zero downtime.",
      author: "Elena Rostova",
      role: "Senior AI Engineer at NeuralSearch",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      rating: 5,
    },
    {
      quote: "The /thumb proxy endpoint solved all our CORS and CDN hotlinking blocks instantly. We're now proxying thousands of high-res thumbnails safely.",
      author: "Marcus Vance",
      role: "CTO at MediaScale Systems",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="relative bg-zinc-950 py-24 sm:py-32 border-b border-zinc-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Developer Feedback
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted By Engineering Teams
          </p>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            See how developers build resilient image search features with our multi-provider stack.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-sm border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-zinc-300 italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4 pt-6 border-t border-zinc-800/80">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="h-11 w-11 rounded-sm object-cover border border-violet-500/30"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <CheckCircle className="h-3.5 w-3.5 text-violet-400" />
                  </h4>
                  <p className="text-xs text-zinc-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
