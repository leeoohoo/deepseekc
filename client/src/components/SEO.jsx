import { Helmet } from 'react-helmet-async'

const defaultMeta = {
  title: 'Deepseek CLI',
  description: 'AI-powered terminal assistant with sub-agent marketplace, task tracking, and MCP tools. Build smarter with intelligent automation.',
  image: '/og-image.png',
  url: 'https://deepseek-cli.com'
}

export default function SEO({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  keywords = 'AI CLI, terminal assistant, sub-agent, MCP tools, task automation, deepseek'
}) {
  const seo = {
    title: title ? `${title} | ${defaultMeta.title}` : defaultMeta.title,
    description: description || defaultMeta.description,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url
  }

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="Deepseek CLI" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Canonical */}
      <link rel="canonical" href={seo.url} />
      
      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Deepseek CLI",
          "description": seo.description,
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "macOS, Linux, Windows",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}
      </script>
    </Helmet>
  )
}