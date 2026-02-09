// pages/About/About.jsx
import { Link } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import TaskIcon from '@mui/icons-material/Task';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import './about.css';
import React from 'react';
import { MongoDBIcon, NodeIcon, ReactIcon, SocketIcon } from '../../utils/svgIcons';

const About = () => {
  return (
    <>
      <Header />
      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-title">
              Welcome to <span className="brand-name">TaskFlow</span>
            </h1>
            <p className="about-subtitle">
              Where productivity meets collaboration
            </p>
            <p className="about-description">
              TaskFlow is a modern task management platform that combines the power 
              of project organization with social collaboration. Stay productive, 
              connected, and in control—all in one place.
            </p>
            <Link to="/signup" className="cta-button">
              Get Started Free
            </Link>
          </div>
        </section>

        {/* What is TaskFlow */}
        <section className="about-section">
          <div className="container">
            <h2 className="section-title">What is TaskFlow?</h2>
            <p className="section-text">
              TaskFlow is more than just a task manager—it's a collaborative workspace 
              designed for teams and individuals who want to get things done efficiently. 
              Whether you're managing personal projects, coordinating with teammates, or 
              tracking team progress, TaskFlow brings everything together in one intuitive platform.
            </p>
            <p className="section-text">
              Built with modern web technologies and real-time capabilities, TaskFlow ensures 
              you're always in sync with your tasks and your team. From simple to-do lists to 
              complex project workflows, we've got you covered.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="about-section features-section">
          <div className="container">
            <h2 className="section-title">Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <TaskIcon style={{ fontSize: '40px', color: '#535bf2' }} />
                </div>
                <h3>Smart Task Management</h3>
                <p>
                  Create, organize, and prioritize tasks with ease. Set deadlines, 
                  assign priorities, add rich descriptions, and attach files—all in 
                  one place.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <GroupIcon style={{ fontSize: '40px', color: '#535bf2' }} />
                </div>
                <h3>Team Collaboration</h3>
                <p>
                  Assign tasks to team members, track progress, and collaborate 
                  seamlessly. Follow colleagues, share updates, and build your 
                  professional network.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <ChatIcon style={{ fontSize: '40px', color: '#535bf2' }} />
                </div>
                <h3>Real-time Communication</h3>
                <p>
                  Comment on tasks, reply to discussions, react with emojis, and 
                  send direct messages—all in real-time. Stay connected with your team 
                  wherever you are.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <NotificationsIcon style={{ fontSize: '40px', color: '#535bf2' }} />
                </div>
                <h3>Smart Notifications</h3>
                <p>
                  Never miss an update. Get notified about task assignments, mentions, 
                  comments, deadlines, and more. Customize what you want to be notified about.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <CloudUploadIcon style={{ fontSize: '40px', color: '#535bf2' }} />
                </div>
                <h3>File Attachments</h3>
                <p>
                  Upload images, videos, documents, and files directly to tasks and comments. 
                  Everything is stored securely in the cloud and accessible anywhere.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <TrendingUpIcon style={{ fontSize: '40px', color: '#535bf2' }} />
                </div>
                <h3>Progress Tracking</h3>
                <p>
                  Monitor task status, track completion rates, and view analytics. 
                  See who's viewed your profile and measure your productivity over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose TaskFlow */}
        <section className="about-section why-section">
          <div className="container">
            <h2 className="section-title">Why Choose TaskFlow?</h2>
            <div className="why-grid">
              <div className="why-item">
                <h3>🚀 Modern & Intuitive</h3>
                <p>
                  Clean, beautiful interface that's easy to use. No learning curve—just 
                  sign up and start being productive.
                </p>
              </div>

              <div className="why-item">
                <h3>⚡ Real-time Everything</h3>
                <p>
                  See updates instantly. Know who's online, get live notifications, and 
                  collaborate in real-time.
                </p>
              </div>

              <div className="why-item">
                <h3>🎨 Rich Media Support</h3>
                <p>
                  Add images, videos, and files to your tasks. Express yourself with 
                  reactions and rich text formatting.
                </p>
              </div>

              <div className="why-item">
                <h3>🔐 Secure & Reliable</h3>
                <p>
                  Your data is encrypted and stored securely. Sign in with Google or 
                  create a secure account—your choice.
                </p>
              </div>

              <div className="why-item">
                <h3>📱 Accessible Anywhere</h3>
                <p>
                  Works seamlessly on desktop, tablet, and mobile. Access your tasks 
                  from anywhere, anytime.
                </p>
              </div>

              <div className="why-item">
                <h3>🆓 Free to Use</h3>
                <p>
                  Get started for free with all core features. No credit card required. 
                  Upgrade when you're ready for more.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="about-section how-section">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Sign Up</h3>
                  <p>
                    Create your free account in seconds. Use email or sign in with Google.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Create Tasks</h3>
                  <p>
                    Start adding tasks, set priorities, deadlines, and assign them to yourself or teammates.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Collaborate</h3>
                  <p>
                    Comment, react, share files, and communicate with your team in real-time.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Track Progress</h3>
                  <p>
                    Monitor completion, view analytics, and celebrate achievements together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built With */}
        <section className="about-section tech-section">
          <div className="container">
            <h2 className="section-title">Built with Modern Technology</h2>
            <p className="section-text" style={{ textAlign: 'center', marginBottom: '40px' }}>
              TaskFlow is built using cutting-edge web technologies to ensure speed, 
              reliability, and an exceptional user experience.
            </p>
            <div className="tech-stack">
              <div className="tech-item">
                <ReactIcon size={50}/>
                <span>React</span>
              </div>
              <div className="tech-item">
                <NodeIcon size={50}/>
                <span>Node.js</span>
              </div>
              <div className="tech-item">
                <MongoDBIcon size={50}/>
                <span>MongoDB</span>
              </div>
              <div className="tech-item">
                <SocketIcon size={50}/>
                <span>Socket.IO</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="container">
            <h2>Ready to boost your productivity?</h2>
            <p>Join thousands of users who are getting things done with TaskFlow</p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button primary">
                Start Free Today
              </Link>
              <Link to="/signin" className="cta-button secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;