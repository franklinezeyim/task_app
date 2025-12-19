import './header.css'
import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import ProgressiveBar from '../progressiveBar/ProgressivBar';

const Header = () => {
  const [query, setQuery] = useState('')
  const [dropDown, setDropDown] = useState(false)


  const handleChange = (e) => setQuery(e.target.value)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // replace with real search action
      console.log('Search for:', query)
    }
  }

  const toggleDropDown = () => {
    setDropDown(!dropDown)
  }

  return (
    <>
    <div className='header'>
      <div className="headerLeft">
        <LogoDevIcon/>
        <div className="search">
          <SearchIcon className="searchIcon"/>
          <input
            type="search"
            name="searchInput"
            placeholder="Search tasks, people, dates..."
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            className="searchInput"
          />
        </div>
      </div>
      <div className="headerRight">
        <div className='headerRightItem'>
          <a href="/">
            <HomeIcon className='icon'/>
            <p>Home</p>
          </a>
        </div>
        <div className='headerRightItem'>
          <MessageIcon className='icon'/>
          <p>Messaging</p>
        </div>
        <div className='headerRightItem'>
          <NotificationsIcon className='icon'/>
          <p>Notification</p>
        </div>
        <div className='headerRightItem'>
          <img src="/general/images/franklin.jpg" alt="user_profile_img" onClick={toggleDropDown} />
          <div style={{display: "flex", alignItems: 'center'}}>
          <p>Me</p>
          <ArrowDropDownIcon/>
          </div>
          {
            dropDown ? (
            <ul className="hrDropDown">
                <li><p>Sign out</p></li>
                <li><p>Delete Account</p></li>
            </ul>
            ) : ""
          }
        </div>
      </div>
    </div>
    <ProgressiveBar/>
    </>
  )
}

export default Header