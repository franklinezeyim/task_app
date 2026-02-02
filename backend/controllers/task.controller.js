import Task from '../models/task.model.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Multer configuration with file validation
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos allowed.'), false);
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, folder = 'todo_app/tasks') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: 'auto' 
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo, tags } = req.body;

    // Validate required fields
    if (!title || !dueDate || !assignedTo) {
      return res.status(400).json({ 
        message: "Title, due date, and assignedTo are required" 
      });
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer);
          
          attachments.push({
            url: result.secure_url,
            publicId: result.public_id,
            type: file.mimetype.startsWith("video") ? "video" : "image",
            size: file.size,
            filename: file.originalname
          });
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          // Continue with other files even if one fails
        }
      }
    }

    // Parse tags if provided as string
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const task = await Task.create({
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      assignedTo,
      attachments,
      tags: parsedTags,
      createdBy: req.user.id,
      statusHistory: [{
        status: "pending",
        changedBy: req.user.id,
        changedAt: new Date()
      }]
    });

    // Populate references
    await task.populate('assignedTo', 'displayName email');
    await task.populate('createdBy', 'displayName email');

    res.status(201).json({ 
      success: true,
      data: task 
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get Tasks with filtering and pagination (Home Page)
export const getAllTasks = async (req, res) => {
  try {
    let { 
      page = 1, 
      limit = 5,
      sortBy = 'createdAt',
      order = 'desc',
      search
    } = req.query;
    
    // ✅ CRITICAL: Convert to numbers with defaults
   page = parseInt(page) || 1;
   limit = parseInt(limit) || 10;

      // ✅ Validate pagination values
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // Max 100 items per page
    
    const query = {}
    // Add search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // ✅ Calculate skip AFTER converting to number
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'displayName email userImage')
        .populate('createdBy', 'displayName email userImage')
        .lean(),
      Task.countDocuments(query)
    ]);

    res.json({
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get Tasks with filtering and pagination (User's Dashboard)
export const getTasks = async (req, res) => {
  try {
    let { 
      status, 
      priority, 
      page = 1, 
      limit = 5,
      sortBy = 'createdAt',
      order = 'desc',
      search
    } = req.query;
    
    // ✅ CRITICAL: Convert to numbers with defaults
   page = parseInt(page) || 1;
   limit = parseInt(limit) || 10;

      // ✅ Validate pagination values
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // Max 100 items per page

    let query = {
      assignedTo: req.user.id,
      isArchived: false
    };


    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Add search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // const skip = (parseInt(page) - 1) * parseInt(limit);
    // const sortOrder = order === 'asc' ? 1 : -1;
    // ✅ Calculate skip AFTER converting to number
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'displayName email userImage')
        .populate('createdBy', 'displayName email userImage')
        .lean(),
      Task.countDocuments(query)
    ]);

    //  const totalPages = Math.ceil(total / limit);

    // console.log('✅ Result:', {
    //   total,
    //   returned: tasks.length,
    //   page,
    //   limit,
    //   totalPages,
    //   skip
    // });

    // ✅ VERIFY: tasks.length should equal limit (or less on last page)
    const expectedCount = Math.min(limit, Math.max(0, total - skip));
    if (tasks.length !== expectedCount) {
      console.warn('⚠️ PAGINATION ERROR!');
      console.warn('Expected:', expectedCount, 'Got:', tasks.length);
    }

    // Get user statistics
    const stats = await Task.getUserStats(req.user.id);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats
    });

    // In your backend, add logging:
// console.log('User ID:', req.user.id);
// console.log('Query:', query);
// console.log('Tasks found:', tasks.length);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update Task Status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "in_progress", "late", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status. Allowed: " + allowedStatuses.join(', ')
      });
    }

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // Authorization check
    if (task.assignedTo.toString() !== req.user.id && 
        task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this task" 
      });
    }

    // Prevent changing completed tasks (unless uncompleting)
    if (task.status === "completed" && status !== "pending") {
      return res.status(400).json({ 
        success: false,
        message: "Cannot change completed task status (except to reopen)" 
      });
    }

    // Use instance method to update status
    task.updateStatus(status, req.user.id);

    await task.save();
    await task.populate('assignedTo', 'displayName email');

    res.json({ 
      success: true,
      data: task 
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update Task (full update)
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // Authorization check
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Only task creator can edit task details" 
      });
    }

    // Prevent updating certain fields
    delete updates.createdBy;
    delete updates.statusHistory;
    delete updates.isArchived;
    delete updates.completedAt;

    Object.assign(task, updates);
    await task.save();

    res.json({ 
      success: true,
      data: task 
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete Task (soft delete via archive)
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // Authorization check
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Only task creator can delete tasks" 
      });
    }

    // Delete attachments from Cloudinary
    if (task.attachments && task.attachments.length > 0) {
      for (const attachment of task.attachments) {
        if (attachment.publicId) {
          try {
            await cloudinary.uploader.destroy(attachment.publicId);
          } catch (err) {
            console.error('Cloudinary deletion error:', err);
          }
        }
      }
    }

    await task.deleteOne();

    res.json({ 
      success: true,
      message: "Task deleted successfully" 
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Archive Task
export const archiveTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // Authorization check
    if (task.assignedTo.toString() !== req.user.id && 
        task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to archive this task" 
      });
    }

    task.isArchived = true;
    await task.save();

    res.json({ 
      success: true,
      message: "Task archived successfully",
      data: task 
    });
  } catch (error) {
    console.error('Archive task error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get Archived Tasks
export const getArchivedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
      isArchived: true
    })
    .sort({ updatedAt: -1 })
    .populate('assignedTo', 'displayName email')
    .lean();

    res.json({ 
      success: true,
      data: tasks 
    });
  } catch (error) {
    console.error('Get archived tasks error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};