import type { AIDescription } from './types'

export interface VisionAnalysisResult extends AIDescription {
  labels?: string[]
}

export async function identifyItemFromBase64(base64: string): Promise<VisionAnalysisResult | null> {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('Analyze API error:', err)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to analyze image (base64):', error)
    return null
  }
}

export async function identifyItemFromUrl(imageUrl: string): Promise<VisionAnalysisResult | null> {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('Analyze API error:', err)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to analyze image (URL):', error)
    return null
  }
}

export async function identifyItem(file: File): Promise<VisionAnalysisResult | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      resolve(await identifyItemFromBase64(base64))
    }
    reader.onerror = () => {
      console.error('Failed to read file')
      resolve(null)
    }
    reader.readAsDataURL(file)
  })
}

export function generateDescriptionFromAI(data: VisionAnalysisResult): string {
  const parts: string[] = []

  if (data.color && data.color !== 'unknown') {
    parts.push(`${data.color.charAt(0).toUpperCase() + data.color.slice(1)} ${data.item}`)
  } else if (data.item) {
    parts.push(data.item)
  }

  if (data.text) {
    parts.push(`Text visible: "${data.text}"`)
  }

  if (data.labels && data.labels.length > 0) {
    const extra = data.labels
      .filter((l) => l.toLowerCase() !== data.item.toLowerCase())
      .slice(0, 4)
    if (extra.length > 0) {
      parts.push(`Tags: ${extra.join(', ')}`)
    }
  }

  return parts.join('. ') || 'No description available'
}
