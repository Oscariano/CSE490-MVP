import type { AIDescription } from './types'

const IMAGE_RECOGNITION_API_URL = process.env.NEXT_PUBLIC_IMAGE_RECOGNITION_API_URL || 'http://localhost:8000'

export interface ImageRecognitionResponse {
  file_name: string
  data: AIDescription | { status: string; confidence?: number } | { error: string }
}

export async function identifyItem(file: File): Promise<AIDescription | null> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${IMAGE_RECOGNITION_API_URL}/identify`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result: ImageRecognitionResponse = await response.json()

    if ('error' in result.data) {
      console.error('Image recognition error:', result.data.error)
      return null
    }

    if ('status' in result.data) {
      console.warn('Image recognition status:', result.data.status)
      return null
    }

    return result.data as AIDescription
  } catch (error) {
    console.error('Failed to identify item:', error)
    return null
  }
}

export function generateDescriptionFromAI(aiDescription: AIDescription): string {
  const parts: string[] = []
  
  if (aiDescription.color) {
    parts.push(aiDescription.color)
  }
  
  if (aiDescription.item) {
    parts.push(aiDescription.item)
  }
  
  let description = parts.join(' ')
  
  if (aiDescription.text) {
    description += `. Text visible: "${aiDescription.text}"`
  }
  
  return description || 'No description available'
}
