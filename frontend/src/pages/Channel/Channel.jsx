import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { getMyVideos } from '../../api/video/client'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import UploadVideoDialog from '../../components/UploadVideoDialog'
import '../Home/Home.css'
import './Channel.css'

const formatViews = (views) => {
  const count = Number(views) || 0
  return `${new Intl.NumberFormat().format(count)} ${count === 1 ? 'view' : 'views'}`
}

const formatUploadDate = (date) => {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? 'Upload date unavailable'
    : `Uploaded ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsedDate)}`
}

const Channel = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const name = user?.fullName || user?.username || 'Your channel'

  useEffect(() => {
    const controller = new AbortController()

    getMyVideos({ signal: controller.signal })
      .then(setVideos)
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load your videos. Please try again.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  const handleRetry = async () => {
    setLoading(true)
    setError('')

    try {
      setVideos(await getMyVideos())
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load your videos. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (logoutError) {
      setError(logoutError.message || 'Unable to log out. Please try again.')
    }
  }

  const handleUploadSuccess = (uploadedVideo) => {
    setVideos((currentVideos) => [
      uploadedVideo,
      ...currentVideos.filter((video) => video._id !== uploadedVideo._id),
    ])
  }

  return (
    <div className='home-page'>
      <Navbar
        user={user}
        onMenuClick={() => setSidebarExpanded((expanded) => !expanded)}
        onLogout={handleLogout}
        onCreateClick={() => setUploadDialogOpen(true)}
      />
      <div className='home-layout'>
        <Sidebar
          expanded={sidebarExpanded}
          activeSection='Your channel'
          onNavigate={(section) => {
            if (section === 'Home') navigate('/home')
          }}
        />
        <main className='home-main channel-main'>
          <header className='channel-header'>
            <h1>{name}</h1>
            <p>Your uploaded videos</p>
          </header>

          {error ? (
            <div className='channel-status' role='alert'>
              <p>{error}</p>
              <button
                className='home-retry-button'
                onClick={handleRetry}
                type='button'
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <p className='channel-status' role='status'>Loading your videos...</p>
          ) : videos.length > 0 ? (
            <section aria-label='Your videos' className='channel-video-grid'>
              {videos.map((video) => (
                <Link
                  aria-label={`Watch ${video.title}`}
                  className='video-card-link'
                  key={video._id}
                  to={`/watch/${video._id}`}
                >
                  <article className='video-card channel-video-card'>
                    <div className='video-thumbnail'>
                      <img alt='' loading='lazy' src={video.thumbnail} />
                    </div>
                    <div className='channel-video-copy'>
                      <h2 title={video.title}>{video.title}</h2>
                      <p>{formatViews(video.views)} <span aria-hidden='true'>·</span> {formatUploadDate(video.createdAt)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </section>
          ) : (
            <div className='channel-status'>
              <h2>No videos yet</h2>
              <p>Videos you upload will appear here.</p>
              <button
                className='home-retry-button'
                onClick={() => navigate('/home')}
                type='button'
              >
                Go to Home
              </button>
            </div>
          )}
        </main>
      </div>
      <UploadVideoDialog
        onClose={() => setUploadDialogOpen(false)}
        onUploaded={handleUploadSuccess}
        open={uploadDialogOpen}
      />
    </div>
  )
}

export default Channel
