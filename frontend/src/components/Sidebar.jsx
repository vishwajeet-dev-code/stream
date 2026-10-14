import {
  Clock3,
  Compass,
  Flame,
  History,
  House,
  ListVideo,
  ThumbsUp,
  Video,
} from 'lucide-react'

const primaryLinks = [
  { label: 'Home', icon: House },
  { label: 'Shorts', icon: Flame },
  { label: 'Explore', icon: Compass },
]

const libraryLinks = [
  { label: 'Library', icon: ListVideo },
  { label: 'History', icon: History },
  { label: 'Watch later', icon: Clock3 },
  { label: 'Liked videos', icon: ThumbsUp },
]

const Sidebar = ({ expanded, activeSection, onNavigate }) => {
  const renderLink = ({ label, icon: Icon }) => (
    <button
      aria-current={activeSection === label ? 'page' : undefined}
      aria-label={expanded ? undefined : label}
      className={`sidebar-link${activeSection === label ? ' is-active' : ''}`}
      key={label}
      onClick={() => onNavigate(label)}
      title={expanded ? undefined : label}
      type='button'
    >
      <Icon size={21} strokeWidth={activeSection === label ? 2.3 : 1.8} />
      {expanded && <span>{label}</span>}
    </button>
  )

  return (
    <aside
      aria-label='Main navigation'
      className={`home-sidebar${expanded ? ' is-expanded' : ' is-collapsed'}`}
    >
      <nav className='sidebar-nav'>
        <div className='sidebar-group'>{primaryLinks.map(renderLink)}</div>
        <div className='sidebar-divider' />
        {expanded && <h2 className='sidebar-heading'>You</h2>}
        <div className='sidebar-group'>{libraryLinks.map(renderLink)}</div>
        <div className='sidebar-divider' />
        {expanded && (
          <div className='sidebar-signin-note'>
            <Video size={20} />
            <p>Your videos and subscriptions will live here.</p>
          </div>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
