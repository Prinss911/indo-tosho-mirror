// Plugin untuk menangani fallback resource loading yang gagal
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Menangani error loading script dan CSS
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement
      
      if (target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
        console.warn('Resource loading failed, attempting retry:', target)
        
        // Retry loading dengan delay
        setTimeout(() => {
          if (target.tagName === 'SCRIPT') {
            const script = target as HTMLScriptElement
            const newScript = document.createElement('script')
            newScript.src = script.src + '?retry=' + Date.now()
            newScript.type = script.type
            script.parentNode?.replaceChild(newScript, script)
          } else if (target.tagName === 'LINK') {
            const link = target as HTMLLinkElement
            const newLink = document.createElement('link')
            newLink.href = link.href + '?retry=' + Date.now()
            newLink.rel = link.rel
            newLink.type = link.type
            link.parentNode?.replaceChild(newLink, link)
          }
        }, 1000)
      }
    }

    // Menangani error network untuk fetch requests
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init)
        if (!response.ok && response.status >= 400) {
          console.warn('Fetch request failed:', input, response.status)
        }
        return response
      } catch (error) {
        console.warn('Network error, retrying fetch:', input, error)
        // Retry sekali dengan delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        return originalFetch(input, init)
      }
    }

    // Event listener untuk error loading resource
    document.addEventListener('error', handleResourceError, true)
    
    // Cleanup saat plugin di-unmount
    return {
      provide: {
        resourceFallback: {
          retryResource: handleResourceError
        }
      }
    }
  }
})