import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../auth/useAuth'
import { getVideo } from '../../api/video/client'
import '../Home/Home.css'
import './Watch.css'

const formatViews = (views) =>
  `${new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(views) || 0)} views`

const Watch = () => {
  const { videoId } = useParams()
  const { user, logout } = useAuth()
  const [video, setVideo] = useState(null)
  const [error, setError] = useState('')
  const [loadedVideoId, setLoadedVideoId] = useState(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [logoutError, setLogoutError] = useState('')
  const loading = loadedVideoId !== videoId

  useEffect(() => {
    const controller = new AbortController()

    getVideo(videoId, { signal: controller.signal })
      .then((fetchedVideo) => {
        setVideo(fetchedVideo)
        setError('')
        setLoadedVideoId(videoId)
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError' && !controller.signal.aborted) {
          setError(fetchError.message || 'Unable to load this video. Please try again.')
          setLoadedVideoId(videoId)
        }
      })

    return () => controller.abort()
  }, [videoId])

  const handleLogout = async () => {
    setLogoutError('')
    try {
      await logout()
    } catch (logoutRequestError) {
      setLogoutError(logoutRequestError.message || 'Unable to log out. Please try again.')
    }
  }

  return (
    <div className='home-page watch-page'>
      <Navbar
        user={user}
        onMenuClick={() => setSidebarExpanded((expanded) => !expanded)}
        onLogout={handleLogout}
      />
      <div className='home-layout'>
        <Sidebar
          activeSection='Home'
          expanded={sidebarExpanded}
          onNavigate={() => {}}
        />
        <main className='watch-main'>
          {logoutError && <p className='home-error' role='alert'>{logoutError}</p>}
          {loading ? (
            <p className='watch-status' role='status'>Loading video...</p>
          ) : error ? (
            <section className='watch-message'>
              <h1>Video unavailable</h1>
              <p role='alert'>{error}</p>
              <Link to='/home'>Back to home</Link>
            </section>
          ) : video ? (
            <article className='watch-content'>
              <div className='watch-player'>
                <video
                  controls
                  playsInline
                  poster={video.thumbnail}
                  preload='metadata'
                  src={video.videoFile}
                >
                  Your browser does not support HTML video playback.
                </video>
              </div>
              <h1 className='watch-title'>{video.title}</h1>
              <div className='watch-channel-row'>
                <div className='video-channel-avatar' aria-hidden='true'>
                  {(video.owner?.username || 'S').slice(0, 1).toUpperCase()}
                </div>
                <div className='watch-channel-name'>
                  {video.owner?.username || 'Stream creator'}
                </div>
              </div>
              <section className='watch-description'>
                <p className='watch-views'>{formatViews(video.views)}</p>
                <p>{video.description || 'No description provided.'}</p>
              </section>
            </article>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default Watch
