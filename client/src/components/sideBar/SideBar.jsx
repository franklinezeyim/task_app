import './sideBar.css'
import EditIcon from '@mui/icons-material/Edit';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import PeopleIcon from '@mui/icons-material/People';
import CircleIcon from '@mui/icons-material/Circle';
import ChatIcon from '@mui/icons-material/Chat';
import BarChartIcon from '@mui/icons-material/BarChart';

const SideBar = () => {
  return (
    <div className='sideBar'>
      <div className="sbTop">
        <img src="/general/images/wp.jpg" alt="" className="sbCoverImg" />
        <div className="sbProfile">
          <img src="/general/images/franklin.jpg" alt="" className="sbProfileImg" />
        </div>
        <h3 className="sbUsername">John Franklin</h3>
        <p className="sbUserTitle">Full Stack Developer</p>
        <p className="sbUserBio">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corrupti deleniti a non error vero perspiciatis quisquam. Ea dolore deserunt magnam?</p>
        <div className="sbLocation">
          <LocationPinIcon className='sbLocationIcon'/>
          <span>New York, USA</span>
        </div>
        <div style={{display: "flex", justifyContent: "center", padding: "10px"}}>
          <button className="editButton">
            <span className="editText">Edit Profile</span>
            <EditIcon className='editIcon'/>
          </button>
        </div>
      </div>
      <div className="sbMiddle1">
        <div className="sbItems">
          <div className='sbItem'>
            <PeopleIcon className='sbItemIcon'/>  
            <h4 className="sbTitle">Connections</h4>
          </div>
          <span className="sbCount">150</span>
        </div>
        <div className="sbConnections">
          <img className='sbConnectionImg' src="/general/images/cartoonDP3.jpg" alt="" />
          <CircleIcon className='sbConnectionStatus'/>
          <div className="sbConnection">
            <h4 className='sbConnectionName'>Sarah Lee</h4>
            <p className="sbConnectionBio">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, alias.</p>
            <span>online</span>
          </div>
          <ChatIcon className='sbConnectionChatIcon'/>
        </div>
        <div className="sbConnections">
          <img className='sbConnectionImg' src="/general/images/cartoonDP.jpg" alt="" />
          <CircleIcon className='sbConnectionStatus'/>
          <div className="sbConnection">
            <h4 className='sbConnectionName'>Markus Bush</h4>
            <p className="sbConnectionBio">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, alias.</p>
            <span>online</span>
          </div>
          <ChatIcon className='sbConnectionChatIcon'/>
        </div>
        <div className="sbConnections">
          <img className='sbConnectionImg' src="/general/images/cartoonDP2.jpg" alt="" />
          <CircleIcon className='sbConnectionStatus offline'/>
          <div className="sbConnection">
            <h4 className='sbConnectionName'>Peter Adams</h4>
            <p className="sbConnectionBio">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, alias.</p>
            <span>offline 2mins ago</span>
          </div>
          <ChatIcon className='sbConnectionChatIcon'/>
        </div>
        <div className="sbConnections last">
          <img className='sbConnectionImg' src="/general/images/user.jpg" alt="" />
          <CircleIcon className='sbConnectionStatus'/>
          <div className="sbConnection">
            <h4 className='sbConnectionName'>John Doe</h4>
            <p className="sbConnectionBio">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, alias.</p>
            <span>online</span>
          </div>
          <ChatIcon className='sbConnectionChatIcon'/>
        </div>
        <div className="sbConnectionViewAll">
          <span>View All</span>
        </div>
      </div>
      <div className="sbBottom">
        <div className="sbBottomTittle">
          <BarChartIcon/>
          <h4>Analytics</h4>
        </div>
        <div className="sbBottomItems">
          <div className="sbBottomItem">
            <div>
              <p>Profile Viewers</p>
              <span>3</span>
            </div>
            <div className="sbBottomItemView">
              <span>View</span>
            </div>
          </div>
          <div className="sbBottomItem">
            <div>
              <p>Total Task completed</p>
              <span>3</span>
            </div>
            <div className="sbBottomItemView">
              <span>View</span>
            </div>
          </div>
          <div className="sbBottomItem">
            <div>
              <p>Total Task created</p>
              <span>29</span>
            </div>
            <div className="sbBottomItemView">
              <span>View</span>
            </div>
          </div>
          <div className="sbBottomItem">
            <div>
              <p>Total Task pending</p>
              <span>8</span>
            </div>
            <div className="sbBottomItemView">
              <span>View</span>
            </div>
          </div>
          <div className="sbBottomItem">
            <div>
              <p>Total Reaction</p>
              <span>8</span>
            </div>
            <div className="sbBottomItemView">
              <span>View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar