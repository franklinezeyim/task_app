// migration-remove-comments.js
import mongoose from 'mongoose';
import Task from '../models/task.model.js';

const migrateComments = async () => {
  try {
    await mongoose.connect('YOUR_MONGODB_URI');
    
    console.log('🔄 Starting migration...');
    
    // Remove the comments field from all tasks
    const result = await Task.updateMany(
      {},
      { $unset: { comments: "" } }
    );
    
    console.log('✅ Migration complete!');
    console.log(`Updated ${result.modifiedCount} tasks`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateComments();