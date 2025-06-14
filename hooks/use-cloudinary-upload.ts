'use client'

import { useState } from 'react'
import { getUploadSignature, handleUploadComplete } from '@/app/actions/upload-audio-direct'

interface UploadResult {
  url: string
  duration?: number
}


export const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFile = async (file: File): Promise<UploadResult> => {
    if (!file) {
      throw new Error('No file provided')
    }

    setIsUploading(true)
    setProgress(0)

    try {
      // Get upload configuration from server
      const config = await getUploadSignature()

      // Create form data for Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', config.uploadPreset)
      formData.append('folder', config.folder)

      // Upload directly to Cloudinary with progress tracking
      const result = await uploadWithProgress(formData, config.cloudName)

      // Notify server of successful upload
      await handleUploadComplete(result.url, result.duration)

      return result
    } catch (error) {
      console.error('Upload failed:', error)
      throw error instanceof Error ? error : new Error('Upload failed')
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const uploadWithProgress = (formData: FormData, cloudName: string): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setProgress(Math.round(percentComplete))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve({
              url: response.secure_url,
              duration: response.duration
            })
          } catch (error) {
            reject(new Error('Invalid response from Cloudinary'))
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            reject(new Error(errorResponse.error?.message || `Upload failed with status: ${xhr.status}`))
          } catch {
            reject(new Error(`Upload failed with status: ${xhr.status}`))
          }
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error during upload'))
      }

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out'))
      }

      // Set timeout to 5 minutes for large files
      xhr.timeout = 5 * 60 * 1000

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`)
      xhr.send(formData)
    })
  }

  return {
    uploadFile,
    isUploading,
    progress
  }
}