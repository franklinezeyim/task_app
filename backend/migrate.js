// migrate.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ Connected to MongoDB');
    console.log('🔄 Starting migration...');
    
    // Get the tasks collection directly
    const db = mongoose.connection.db;
    const tasksCollection = db.collection('tasks');
    
    // Check how many tasks have comments field
    const countBefore = await tasksCollection.countDocuments({ 
      comments: { $exists: true } 
    });
    
    console.log(`📊 Found ${countBefore} tasks with comments field`);
    
    if (countBefore === 0) {
      console.log('✅ No tasks need migration');
      await mongoose.disconnect();
      return;
    }
    
    // Remove the comments field from all tasks
    const result = await tasksCollection.updateMany(
      { comments: { $exists: true } },
      { $unset: { comments: "" } }
    );
    
    console.log(`✅ Migration complete! Modified ${result.modifiedCount} tasks`);
    
    // Verify
    const countAfter = await tasksCollection.countDocuments({ 
      comments: { $exists: true } 
    });
    
    console.log(`📊 Tasks with comments field after migration: ${countAfter}`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();