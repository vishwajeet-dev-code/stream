import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../auth/useAuth'
import './Home.css'

const Home = () => {
  const { user, logout } = useAuth()
  const [error, setError] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [activeSection, setActiveSection] = useState('Home')
  const name = user?.fullName || user?.username

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
      />

      <div className='home-layout'>
        <Sidebar
          expanded={sidebarExpanded}
          activeSection={activeSection}
          onNavigate={setActiveSection}
        />

        <main className='home-main'>
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
            <div className='home-feed-icon' aria-hidden='true'>
              <span />
            </div>
            <h1>{activeSection === 'Home' ? 'Your feed is ready' : activeSection}</h1>
            <p>
              {name
                ? `Welcome back, ${name}. Videos will appear here as your Stream library grows.`
                : 'Videos will appear here as your Stream library grows.'}
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Home
