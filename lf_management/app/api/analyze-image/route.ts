import { NextRequest, NextResponse } from 'next/server'

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

interface VisionRequest {
  imageBase64?: string
  imageUrl?: string
}

function nearestColorName(r: number, g: number, b: number): string {
  const colors: [string, number, number, number][] = [
    ['red', 255, 0, 0],
    ['green', 0, 128, 0],
    ['blue', 0, 0, 255],
    ['yellow', 255, 255, 0],
    ['orange', 255, 165, 0],
    ['purple', 128, 0, 128],
    ['pink', 255, 192, 203],
    ['brown', 139, 69, 19],
    ['black', 0, 0, 0],
    ['white', 255, 255, 255],
    ['gray', 128, 128, 128],
    ['beige', 245, 245, 220],
    ['navy', 0, 0, 128],
    ['teal', 0, 128, 128],
    ['maroon', 128, 0, 0],
    ['olive', 128, 128, 0],
    ['silver', 192, 192, 192],
    ['gold', 255, 215, 0],
    ['tan', 210, 180, 140],
  ]

  let closest = 'unknown'
  let minDist = Infinity
  for (const [name, cr, cg, cb] of colors) {
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
    if (dist < minDist) {
      minDist = dist
      closest = name
    }
  }
  return closest
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_CLOUD_VISION_API_KEY is not configured' },
      { status: 500 }
    )
  }

  let body: VisionRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { imageBase64, imageUrl } = body
  if (!imageBase64 && !imageUrl) {
    return NextResponse.json(
      { error: 'Provide either imageBase64 or imageUrl' },
      { status: 400 }
    )
  }

  const image: Record<string, unknown> = {}
  if (imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    image.content = base64Data
  } else if (imageUrl) {
    image.source = { imageUri: imageUrl }
  }

  const visionPayload = {
    requests: [
      {
        image,
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'TEXT_DETECTION', maxResults: 5 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
        ],
      },
    ],
  }

  try {
    const visionRes = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visionPayload),
    })

    if (!visionRes.ok) {
      const errBody = await visionRes.text()
      console.error('Vision API error:', errBody)
      return NextResponse.json(
        { error: `Vision API returned ${visionRes.status}` },
        { status: 502 }
      )
    }

    const visionData = await visionRes.json()
    const response = visionData.responses?.[0]
    if (!response) {
      return NextResponse.json(
        { error: 'Empty response from Vision API' },
        { status: 502 }
      )
    }

    const objects = response.localizedObjectAnnotations || []
    const labels = response.labelAnnotations || []
    const textAnnotations = response.textAnnotations || []
    const colorInfo =
      response.imagePropertiesAnnotation?.dominantColors?.colors || []

    const topObject = objects[0]
    const topLabel = labels[0]
    const item = topObject?.name || topLabel?.description || 'Unknown item'
    const confidence = topObject?.score ?? topLabel?.score ?? 0

    let color = 'unknown'
    if (colorInfo.length > 0) {
      const dc = colorInfo[0].color || {}
      color = nearestColorName(
        Math.round(dc.red || 0),
        Math.round(dc.green || 0),
        Math.round(dc.blue || 0)
      )
    }

    const detectedText =
      textAnnotations.length > 0 ? textAnnotations[0].description?.trim() : ''

    const allLabels = labels.map(
      (l: { description: string }) => l.description
    )

    return NextResponse.json({
      item,
      color,
      text: detectedText || '',
      confidence,
      labels: allLabels,
    })
  } catch (error) {
    console.error('Vision API request failed:', error)
    return NextResponse.json(
      { error: 'Failed to contact Vision API' },
      { status: 502 }
    )
  }
}
