import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../auth/useAuth'
import { getVideos, uploadVideo } from '../../api/video/client'
import './Home.css'

const formatDuration = (seconds) => {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60
  const paddedSeconds = String(remainingSeconds).padStart(2, '0')

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`
}

const Home = () => {
  const { user, logout } = useAuth()
  const [error, setError] = useState('')
  const [videos, setVideos] = useState([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTransferComplete, setUploadTransferComplete] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadNotice, setUploadNotice] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [activeSection, setActiveSection] = useState('Home')
  const name = user?.fullName || user?.username

  useEffect(() => {
    const controller = new AbortController()
    getVideos({ signal: controller.signal })
      .then((fetchedVideos) => {
        setVideos(fetchedVideos)
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load videos. Please try again.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setVideosLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  const handleRetry = async () => {
    setVideosLoading(true)
    setError('')

    try {
      setVideos(await getVideos())
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load videos. Please try again.')
    } finally {
      setVideosLoading(false)
    }
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setUploading(true)
    setUploadProgress(0)
    setUploadTransferComplete(false)
    setUploadError('')
    setUploadNotice('')

    const formData = new FormData(event.currentTarget)
    try {
      const uploadedVideo = await uploadVideo(formData, (progress) => {
        setUploadProgress(progress)
        if (progress === 100) {
          setUploadTransferComplete(true)
        }
      })
      setVideos((currentVideos) => [
        uploadedVideo,
        ...currentVideos.filter((video) => video._id !== uploadedVideo._id),
      ])
      setUploadDialogOpen(false)

      try {
        setVideos(await getVideos())
      } catch {
        setUploadNotice('Video uploaded. The feed could not be refreshed.')
      }
    } catch (uploadRequestError) {
      setUploadProgress(0)
      setUploadTransferComplete(false)
      setUploadError(uploadRequestError.message || 'Unable to upload video. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    try {
      await logout()
    } catch (logoutError) {
      setError(logoutError.message || 'Unable to log out. Please try again.')
    }
  }

  return (
    <div className='home-page'>
      <Navbar
        user={user}
        onMenuClick={() => setSidebarExpanded((expanded) => !expanded)}
        onLogout={handleLogout}
        onCreateClick={() => {
          setUploadError('')
          setUploadDialogOpen(true)
        }}
      />

      <div className='home-layout'>
        <Sidebar
          expanded={sidebarExpanded}
          activeSection={activeSection}
          onNavigate={setActiveSection}
        />

        <main className='home-main'>
          {uploadNotice && (
            <p className='upload-notice' role='status'>
              {uploadNotice}
            </p>
          )}
          {error && (
            <p className='home-error' role='alert'>
              {error}
            </p>
          )}

          <div className='home-category-bar' aria-label='Video categories'>
            {['All', 'Music', 'Gaming', 'Podcasts', 'Live', 'Recently uploaded'].map(
              (category, index) => (
                <button
                  className={`home-category${index === 0 ? ' is-active' : ''}`}
                  key={category}
                  type='button'
                >
                  {category}
                </button>
              ),
            )}
          </div>

          <section className='home-feed' aria-label='Recommended videos'>
            {videosLoading ? (
              <p className='home-feed-status' role='status'>Loading videos...</p>
            ) : error ? (
              <div className='home-feed-empty'>
                <h1>Videos couldn’t be loaded</h1>
                <button className='home-retry-button' onClick={handleRetry} type='button'>
                  Try again
                </button>
              </div>
            ) : videos.length > 0 ? (
              <div className='video-grid'>
                {videos.map((video) => (
                  <Link
                    aria-label={`Watch ${video.title}`}
                    className='video-card-link'
                    key={video._id}
                    to={`/watch/${video._id}`}
                  >
                    <article className='video-card'>
                      <div className='video-thumbnail'>
                        <img alt='' loading='lazy' src={video.thumbnail} />
                        <span className='video-duration'>{formatDuration(video.duration)}</span>
                      </div>
                      <div className='video-card-details'>
                        <div className='video-channel-avatar' aria-hidden='true'>
                          {(video.owner?.username || video.title || 'V').slice(0, 1).toUpperCase()}
                        </div>
                        <div className='video-card-copy'>
                          <h2 title={video.title}>{video.title}</h2>
                          <p>{video.owner?.username || 'Stream creator'}</p>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='home-feed-empty'>
                <div className='home-feed-icon' aria-hidden='true'>
                  <span />
                </div>
                <h1>{activeSection === 'Home' ? 'No videos yet' : activeSection}</h1>
                <p>
                  {name
                    ? `Welcome back, ${name}. Uploaded videos will appear here.`
                    : 'Uploaded videos will appear here.'}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
      {uploadDialogOpen && (
        <div
          className='upload-dialog-backdrop'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !uploading) {
              setUploadDialogOpen(false)
            }
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
                onClick={() => setUploadDialogOpen(false)}
                type='button'
              >
                <X size={20} />
              </button>
            </div>
            <form className='upload-form' onSubmit={handleUpload}>
              <label>
                Title
                <input
                  autoFocus
                  maxLength={120}
                  name='title'
                  placeholder='Add a title'
                  required
                />
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
                      {uploadTransferComplete
                        ? 'Files sent. Processing video...'
                        : 'Uploading video...'}
                    </span>
                    {!uploadTransferComplete && <span>{uploadProgress}%</span>}
                  </div>
                  <progress
                    aria-label={uploadTransferComplete ? 'Upload processing' : 'Upload progress'}
                    className={uploadTransferComplete ? 'is-processing' : ''}
                    max='100'
                    value={uploadProgress}
                  />
                </div>
              )}
              {uploadError && (
                <p className='home-error upload-form-error' role='alert'>
                  {uploadError}
                </p>
              )}
              <div className='upload-form-actions'>
                <button
                  className='upload-cancel-button'
                  disabled={uploading}
                  onClick={() => setUploadDialogOpen(false)}
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
      )}
    </div>
  )
}

export default Home
