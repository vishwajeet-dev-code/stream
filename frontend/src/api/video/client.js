const API_BASE_URL = (
  import.meta.env.API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '')
const API_ROOT = API_BASE_URL.endsWith('/api/v1/users')
  ? API_BASE_URL.slice(0, -'/api/v1/users'.length)
  : API_BASE_URL
const VIDEOS_API_URL = API_ROOT.endsWith('/api/v1/video')
  ? API_ROOT
  : `${API_ROOT}/api/v1/video`

export async function getVideos({ signal } = {}) {
  const response = await fetch(VIDEOS_API_URL, { signal })
  const isJsonResponse = response.headers
    .get('content-type')
    ?.includes('application/json')
  const result = isJsonResponse ? await response.json() : null

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || 'Unable to load videos. Please try again.')
  }

  if (!Array.isArray(result.data)) {
    throw new Error('The videos response was not in the expected format.')
  }

  return result.data
}

export async function getMyVideos({ signal } = {}) {
  const response = await fetch(`${VIDEOS_API_URL}/my-videos`, {
    credentials: 'include',
    signal,
  })
  const isJsonResponse = response.headers
    .get('content-type')
    ?.includes('application/json')
  const result = isJsonResponse ? await response.json() : null

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || 'Unable to load your videos. Please try again.')
  }

  if (!Array.isArray(result.data)) {
    throw new Error('Your videos response was not in the expected format.')
  }

  return result.data
}

export async function getVideo(videoId, { signal } = {}) {
  const response = await fetch(
    `${VIDEOS_API_URL}/${encodeURIComponent(videoId)}`,
    { signal },
  )
  const isJsonResponse = response.headers
    .get('content-type')
    ?.includes('application/json')
  const result = isJsonResponse ? await response.json() : null

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || 'Unable to load this video. Please try again.')
  }

  if (!result.data || typeof result.data !== 'object') {
    throw new Error('The video response was not in the expected format.')
  }

  return result.data
}

export function uploadVideo(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${VIDEOS_API_URL}/upload-video`)
    xhr.withCredentials = true

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100))
      }
    })
    xhr.upload.addEventListener('load', () => onProgress?.(100))
    xhr.addEventListener('error', () => {
      reject(new Error('Network error while uploading. Please try again.'))
    })
    xhr.addEventListener('load', () => {
      const isJsonResponse = xhr.getResponseHeader('content-type')
        ?.includes('application/json')
      let result = null

      if (isJsonResponse && xhr.responseText) {
        try {
          result = JSON.parse(xhr.responseText)
        } catch {
          reject(new Error('The server returned an invalid response.'))
          return
        }
      }

      if (xhr.status < 200 || xhr.status >= 300 || !result?.success) {
        reject(new Error(result?.message || 'Unable to upload video. Please try again.'))
        return
      }

      if (!result.data || typeof result.data !== 'object') {
        reject(new Error('The upload response was not in the expected format.'))
        return
      }

      resolve(result.data)
    })
    xhr.send(formData)
  })
}
