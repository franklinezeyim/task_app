import User from "../models/user.model.js";
import Task from '../models/task.model.js'
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// 1️⃣ Update profile info (name, displayName, email)
export const updateProfileInfo = async (req, res) => {
  const { displayName, firstName, lastName, jobTitle, location, bio, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

     // 🛑 Prevent duplicate email
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email already in use" });
    }

    if (displayName) user.displayName = displayName;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (jobTitle) user.jobTitle = jobTitle;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (email) user.email = email;

    await user.save();

    const { hashedPassword, ...result } = user.toObject();
    res.status(200).json({ message: "Profile updated", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Update password
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚫 Google-auth users cannot change password
    if (user.authProvider !== "local" || !user.hashedPassword) {
      return res.status(400).json({
        message: "Google-authenticated users cannot change password",
      });
    }

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing password fields" });
    }

    const valid = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!valid) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    const isSameAsOld = await bcrypt.compare(
      newPassword,
      user.hashedPassword
    );

    if (isSameAsOld) {
      return res
        .status(400)
        .json({ message: "New password must be different" });
    }

    user.hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// 3️⃣ Upload avatar
// export const uploadAvatar = async (req, res) => {
//   console.log(req.userId);
  
//   try {
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//     const result = await cloudinary.uploader.upload_stream(
//       { folder: "todo_app/avatars" },
//       async (error, result) => {
//         if (error) throw error;

//         const user = await User.findById(req.userId);
//         user.userImage = result.secure_url;
//         await user.save();

//         res.json({ message: "Profile photo uploaded", url: result.secure_url });
//       }
//     );

//     result.end(req.file.buffer); // pipe buffer into Cloudinary
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const uploadAvatar = async (req, res) => {
  console.log(req.user.id); // ✅ works

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "todo_app/avatars" },
      async (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        user.userImage = result.secure_url;
        await user.save();

        res.json({
          message: "Profile photo uploaded",
          url: result.secure_url,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// 4️⃣ Upload cover photo (same pattern)
export const uploadCoverPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload_stream(
      { folder: "todo_app/cover_photos" },
      async (error, result) => {
        if (error) throw error;

        const user = await User.findById(req.user.id);
        user.coverPhoto = result.secure_url; // add coverPhoto field to user model
        await user.save();

        res.json({ message: "Cover photo uploaded", url: result.secure_url });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5️⃣ Delete avatar
export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: Delete from Cloudinary if you want to clean up
    if (user.userImage) {
      const publicId = user.userImage.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(`todo_app/avatars/${publicId}`);
    }

    user.userImage = null;
    await user.save();

    const { hashedPassword, ...result } = user.toObject();
    res.json({ message: "Profile photo deleted", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 6️⃣ Delete cover photo
export const deleteCoverPhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: Delete from Cloudinary if you want to clean up
    if (user.coverPhoto) {
      const publicId = user.coverPhoto.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(`todo_app/cover_photos/${publicId}`);
    }

    user.coverPhoto = null;
    await user.save();

    const { hashedPassword, ...result } = user.toObject();
    res.json({ message: "Cover photo deleted", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [
      tasks,
      totalTasks,
      completedTasks,
      pendingTasks,
      lateTasks,
    ] = await Promise.all([
      Task.find({ createdBy: userId, isArchived: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title description status priority dueDate createdAt attachments')
        .lean(),

      Task.countDocuments({ createdBy: userId, isArchived: false }),
      Task.countDocuments({ createdBy: userId, status: 'completed', isArchived: false }),
      Task.countDocuments({ createdBy: userId, status: 'pending', isArchived: false }),
      Task.countDocuments({ createdBy: userId, status: 'late', isArchived: false }),
    ]);

    const totalPages = Math.ceil(totalTasks / limit);

    res.json({
      success: true,
      data: {
        user,
        tasks,
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          lateTasks,
        },
        pagination: {
          total: totalTasks,
          page,
          pages: totalPages,
          limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get user profile by ID (public view)
// export const getUserProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     console.log('📥 Getting profile for user:', userId);

//     // Find user and exclude sensitive fields
//     const user = await User.findById(userId)
//       .select('-password -resetPasswordToken -resetPasswordExpires -__v')
//       .lean();

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Get user's public tasks (optional - for activity section)
//     const tasks = await Task.find({
//       createdBy: userId,
//       isArchived: false
//     })
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .select('title description status priority dueDate createdAt attachments')
//       .lean();

//     // Get user statistics
//     const stats = {
//       totalTasks: await Task.countDocuments({ createdBy: userId, isArchived: false }),
//       completedTasks: await Task.countDocuments({ createdBy: userId, status: 'completed', isArchived: false }),
//       pendingTasks: await Task.countDocuments({ createdBy: userId, status: 'pending', isArchived: false }),
//       lateTasks: await Task.countDocuments({ createdBy: userId, status: 'late', isArchived: false }),
//     };

//     res.json({
//       success: true,
//       data: {
//         user,
//         tasks,
//         stats
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get user profile error:', error);
    
//     // Handle invalid ObjectId
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// Get current user's own profile (authenticated)
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -__v')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get my tasks including private ones
    const tasks = await Task.find({
      createdBy: req.user.id,
      isArchived: false
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('assignedTo', 'displayName email userImage')
      .lean();

    // Get my statistics
    const stats = {
      totalTasks: await Task.countDocuments({ createdBy: req.user.id, isArchived: false }),
      completedTasks: await Task.countDocuments({ createdBy: req.user.id, status: 'completed', isArchived: false }),
      pendingTasks: await Task.countDocuments({ createdBy: req.user.id, status: 'pending', isArchived: false }),
      lateTasks: await Task.countDocuments({ createdBy: req.user.id, status: 'late', isArchived: false }),
    };

    res.json({
      success: true,
      data: {
        user,
        tasks,
        stats
      }
    });
  } catch (error) {
    console.error('❌ Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};














// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, displayName, bio, jobTitle, location } = req.body;

    // Find and update user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (location !== undefined) user.location = location;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires -__v')
      .lean();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Display name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

