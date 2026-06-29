import * as fs from "fs"
import * as path from "path"
import * as os from "os"

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
]

const getApiKey = () => process.env.GEMINI_API_KEY!

const getGenAI = async () => {
  const { GoogleGenerativeAI } = await import(/* webpackIgnore: true */ "@google/generative-ai")
  return new GoogleGenerativeAI(getApiKey())
}

const getFileManager = async () => {
  const { GoogleAIFileManager } = await import(/* webpackIgnore: true */ "@google/generative-ai/server")
  return new GoogleAIFileManager(getApiKey())
}

const getRetryDelay = (err: unknown): number => {
  const e = err as { errorDetails?: { "@type"?: string; retryDelay?: string }[] }
  const retryInfo = e?.errorDetails?.find((d) => d["@type"]?.includes("RetryInfo"))
  if (retryInfo?.retryDelay) return parseInt(retryInfo.retryDelay) * 1000
  return 0
}

const withFallback = async <T>(fn: (modelName: string) => Promise<T>): Promise<T> => {
  let lastErr: unknown
  for (const model of MODELS) {
    try {
      return await fn(model)
    } catch (err: unknown) {
      const e = err as { status?: number }
      if (e?.status === 429 || e?.status === 404 || e?.status === 503) {
        const delay = getRetryDelay(err)
        if (delay > 0 && delay <= 10000) {
          await new Promise((r) => setTimeout(r, delay))
          try {
            return await fn(model)
          } catch {}
        }
        lastErr = err
        continue
      }
      throw err
    }
  }
  throw lastErr
}

export const transcribeWithGemini = async (videoUrl: string): Promise<string> => {
  const tmpPath = path.join(os.tmpdir(), `onyx-${Date.now()}.webm`)

  try {
    const res = await fetch(videoUrl)
    if (!res.ok) throw new Error(`Failed to fetch video: ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(tmpPath, buffer)

    const fileManager = await getFileManager()
    const genAI = await getGenAI()

    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType: "video/webm",
      displayName: `onyx-${Date.now()}`,
    })

    let file = await fileManager.getFile(uploadResult.file.name)
    let attempts = 0
    while (file.state === "PROCESSING" && attempts < 30) {
      await new Promise((r) => setTimeout(r, 3000))
      file = await fileManager.getFile(uploadResult.file.name)
      attempts++
    }

    if (file.state !== "ACTIVE") throw new Error(`File not active: ${file.state}`)

    const text = await withFallback(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent([
        { fileData: { mimeType: "video/webm", fileUri: file.uri } },
        "Please transcribe everything spoken in this video accurately. Return only the spoken words, nothing else. If nothing is spoken, return an empty string.",
      ])
      return result.response.text()
    })

    await fileManager.deleteFile(uploadResult.file.name).catch(() => {})
    return text
  } catch (err) {
    console.error("[Gemini] transcribeWithGemini failed:", err)
    return ""
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
  }
}

export const generateVideoSummary = async (transcription: string) => {
  try {
    if (!transcription.trim()) {
      return { title: "Untitled Video", description: "No description", summary: "" }
    }

    const genAI = await getGenAI()

    const prompt = `You are an AI assistant that creates professional video summaries.

Given this video transcription, generate:
1. A concise, engaging title (max 60 chars)
2. A short description (max 150 chars)
3. A clear summary (2-3 sentences)

Transcription:
"${transcription}"

Respond in this exact JSON format:
{
  "title": "...",
  "description": "...",
  "summary": "..."
}`

    const result = await withFallback((modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName })
      return model.generateContent(prompt)
    })

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as { title: string; description: string; summary: string }

    return { title: "Untitled Video", description: "No description", summary: text }
  } catch (err) {
    console.error("[Gemini] generateVideoSummary failed:", err)
    return { title: "Untitled Video", description: "No description", summary: "" }
  }
}
