import { Link } from "react-router-dom";
import "./form.css";

const SignUpForm = () => {
  return (
    <div className="form">
      <div className="formContent">
        <h2 className="formHeader">Sign up</h2>
        <div className="formField">
          <label htmlFor="firstName">First Name</label>
          <input type="text" />
        </div>
        <div className="formField">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" />
        </div>
        <div className="formField">
          <label htmlFor="email">Email Address</label>
          <input type="text" />
        </div>
        <div className="formField">
          <label htmlFor="password">Password</label>
          <input type="password" />
        </div>
        <div className="formField">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" />
        </div>

        <button type="submit">Submit</button>

        <p className="formFooter">
          Already have an account?
          <Link to='/signin'>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
