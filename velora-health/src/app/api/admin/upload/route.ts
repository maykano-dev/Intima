import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Imgbb API key not configured' }, { status: 500 })
    }

    const imgbbUploadData = new FormData()
    imgbbUploadData.append('image', file)

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbUploadData,
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Imgbb error:', errorData)
      throw new Error('Imgbb upload failed')
    }

    const data = await res.json()
    return NextResponse.json({ url: data.data.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
