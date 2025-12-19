import { Link } from 'react-router-dom'
import './form.css'

const Form = () => {
  return (
            <div className='form'>
                <div className='formContent'>
                    <h2 className="formHeader">Sign in</h2>
                    <div className="formField">
                        <label htmlFor="email">Email Address</label>
                        <input type="text" />
                    </div>
                    <div className="formField">
                        <label htmlFor="userName">Password</label>
                        <input type="text" />
                    </div>
                    
                    <button type="submit">Submit</button>

                    <p className="formFooter">Don't have an account? 
                        <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </div>
    )
}

export default Form