import { useState } from 'react'
import { X } from 'lucide-react'
import { uploadVideo } from '../api/video/client'

const UploadVideoDialog = ({ open, onClose, onUploaded }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transferComplete, setTransferComplete] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setUploading(true)
    setUploadProgress(0)
    setTransferComplete(false)
    setError('')

    try {
      const uploadedVideo = await uploadVideo(
        new FormData(event.currentTarget),
        (progress) => {
          setUploadProgress(progress)
          if (progress === 100) setTransferComplete(true)
        },
      )
      await onUploaded?.(uploadedVideo)
      handleClose()
    } catch (uploadError) {
      setUploadProgress(0)
      setTransferComplete(false)
      setError(uploadError.message || 'Unable to upload video. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className='upload-dialog-backdrop'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !uploading) handleClose()
      }}
    >
      <section
        aria-labelledby='upload-dialog-title'
        aria-modal='true'
        className='upload-dialog'
        role='dialog'
      >
        <div className='upload-dialog-header'>
          <h2 id='upload-dialog-title'>Upload video</h2>
          <button
            aria-label='Close upload dialog'
            className='icon-button'
            disabled={uploading}
            onClick={handleClose}
            type='button'
          >
            <X size={20} />
          </button>
        </div>
        <form className='upload-form' onSubmit={handleUpload}>
          <label>
            Title
            <input autoFocus maxLength={120} name='title' placeholder='Add a title' required />
          </label>
          <label>
            Description
            <textarea
              maxLength={5000}
              name='description'
              placeholder='Tell viewers about your video'
              rows={3}
            />
          </label>
          <label>
            Video file
            <input accept='video/*' name='videoFile' required type='file' />
            <span className='upload-file-hint'>Video files up to 500 MB</span>
          </label>
          <label>
            Thumbnail
            <input accept='image/*' name='thumbnail' required type='file' />
            <span className='upload-file-hint'>Image files up to 500 MB</span>
          </label>
          {uploading && (
            <div aria-live='polite' className='upload-progress'>
              <div className='upload-progress-label'>
                <span>
                  {transferComplete ? 'Files sent. Processing video...' : 'Uploading video...'}
                </span>
                {!transferComplete && <span>{uploadProgress}%</span>}
              </div>
              <progress
                aria-label={transferComplete ? 'Upload processing' : 'Upload progress'}
                className={transferComplete ? 'is-processing' : ''}
                max='100'
                value={uploadProgress}
              />
            </div>
          )}
          {error && (
            <p className='home-error upload-form-error' role='alert'>
              {error}
            </p>
          )}
          <div className='upload-form-actions'>
            <button
              className='upload-cancel-button'
              disabled={uploading}
              onClick={handleClose}
              type='button'
            >
              Cancel
            </button>
            <button className='upload-submit-button' disabled={uploading} type='submit'>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default UploadVideoDialog
