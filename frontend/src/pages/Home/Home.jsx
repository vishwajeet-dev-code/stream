import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import UploadVideoDialog from '../../components/UploadVideoDialog'
import { useAuth } from '../../auth/useAuth'
import { getVideos } from '../../api/video/client'
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
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [videos, setVideos] = useState([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
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

  const handleUploadSuccess = async (uploadedVideo) => {
    setUploadNotice('')
    setVideos((currentVideos) => [
      uploadedVideo,
      ...currentVideos.filter((video) => video._id !== uploadedVideo._id),
    ])

    try {
      setVideos(await getVideos())
    } catch {
      setUploadNotice('Video uploaded. The feed could not be refreshed.')
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
        onCreateClick={() => setUploadDialogOpen(true)}
      />

      <div className='home-layout'>
        <Sidebar
          expanded={sidebarExpanded}
          activeSection={activeSection}
          onNavigate={(section) => {
            if (section === 'Your channel') {
              navigate('/channel')
            } else {
              setActiveSection(section)
            }
          }}
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
      <UploadVideoDialog
        onClose={() => setUploadDialogOpen(false)}
        onUploaded={handleUploadSuccess}
        open={uploadDialogOpen}
      />
    </div>
  )
}

export default Home
