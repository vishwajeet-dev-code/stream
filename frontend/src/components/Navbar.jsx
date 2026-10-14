import { useState } from 'react'
import {
  Bell,
  Menu,
  Mic,
  Plus,
  Search,
  Video,
} from 'lucide-react'

const Navbar = ({ user, onMenuClick, onLogout }) => {
  const [search, setSearch] = useState('')
  const displayName = user?.fullName || user?.username || 'Your account'
  const avatarLabel = displayName.slice(0, 1).toUpperCase()

  return (
    <header className='app-navbar'>
      <div className='navbar-start'>
        <button
          aria-label='Toggle sidebar'
          className='icon-button navbar-menu-button'
          onClick={onMenuClick}
          type='button'
        >
          <Menu size={22} />
        </button>
        <a aria-label='Stream home' className='brand' href='/home'>
          <span className='brand-mark' aria-hidden='true'>
            <Video size={20} fill='currentColor' />
          </span>
          <span className='brand-name'>Stream</span>
        </a>
      </div>

      <form
        className='navbar-search'
        onSubmit={(event) => event.preventDefault()}
        role='search'
      >
        <label className='visually-hidden' htmlFor='stream-search'>
          Search
        </label>
        <input
          id='stream-search'
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search'
          type='search'
          value={search}
        />
        <button aria-label='Search' className='search-submit' type='submit'>
          <Search size={20} />
        </button>
        <button
          aria-label='Search with your voice'
          className='icon-button search-mic'
          type='button'
        >
          <Mic size={19} />
        </button>
      </form>

      <div className='navbar-actions'>
        <button className='create-button' type='button'>
          <Plus size={19} />
          <span>Create</span>
        </button>
        <button aria-label='Notifications' className='icon-button' type='button'>
          <Bell size={21} />
        </button>
        <button
          aria-label={`Log out of ${displayName}`}
          className='account-avatar'
          onClick={onLogout}
          title={`Log out (${displayName})`}
          type='button'
        >
          {avatarLabel}
        </button>
      </div>
    </header>
  )
}

export default Navbar
