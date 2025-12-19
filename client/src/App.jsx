import './App.css'
import { Routes, Route} from 'react-router-dom'
import Form from './components/form/Form.jsx'
import SignUpForm from './components/form/SignUpForm.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Home from './pages/home/Home.jsx'

function App() {

  return (
     <>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/signup' element={<SignUpForm/>} />
        <Route path='/signin' element={<Form/>} />
      </Routes>
    </>
  )
}

export default App
