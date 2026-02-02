import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    jobTitle: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 300
    },
    location: {
    type: String,
    trim: true, 
      maxlength: 100,
      default: ''
    },
    connections: {
      type: Number,
      default: 0
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    followersCount: {
  type: Number,
  default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  isOnline:{
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    follows: {
      type: Boolean,
      default: true
    },
    messages: {
      type: Boolean,
      default: true
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date
    },
    tasks: {
      type: Boolean,
      default: true
    }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    hashedPassword: {
        type: String,
        minlength: 6,
        // Only required if the user registered locally
        required: function () {
        return this.authProvider === "local";
        },
    },
    userImage: {
        type: String,
        default: null
    },
    coverPhoto: {
    type: String,
    default: null
    },
    googleId: {
    type: String,
    default: null
    },
    authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
    },
    // reset password
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loginAttempts: {
  type: Number,
  default: 0,
    },
    lockUntil: {
    type: Date,
    },

},{timestamps: true,toJSON: { virtuals: true },
    toObject: { virtuals: true }});

    // Virtual for follower count
// userSchema.virtual('followerCount').get(function() {
//   return this.followers?.length || 0;
// });

// Virtual for following count
// userSchema.virtual('followingCount').get(function() {
//   return this.following?.length || 0;
// });

// Index for faster queries
// userSchema.index({ displayName: 1 });
// userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema)

export default User