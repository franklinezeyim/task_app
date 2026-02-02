import cron from "node-cron";
import Task from "../models/task.model.js";

// Mark late tasks - runs every hour
export const startLateTaskChecker = () => {
  // Run every hour at minute 0
  const job = cron.schedule("0 * * * *", async () => {
    try {
      console.log('[CRON] Checking for late tasks...');
      
      const now = new Date();
      
      // Find tasks that are past due and not completed or already marked late
      const lateTasks = await Task.find({
        dueDate: { $lt: now },
        status: { $nin: ["completed", "late"] },
        isArchived: false
      });

      if (lateTasks.length === 0) {
        console.log('[CRON] No late tasks found');
        return;
      }

      // Bulk update late tasks
      const bulkOps = lateTasks.map(task => ({
        updateOne: {
          filter: { _id: task._id },
          update: {
            $set: { status: "late" },
            $push: {
              statusHistory: {
                status: "late",
                changedAt: now,
                // System automated change
                changedBy: null
              }
            }
          }
        }
      }));

      const result = await Task.bulkWrite(bulkOps);
      
      console.log(`[CRON] Marked ${result.modifiedCount} tasks as late`);
    } catch (error) {
      console.error('[CRON] Error checking late tasks:', error);
    }
  });

  console.log('[CRON] Late task checker started');
  return job;
};

// Clean up old archived tasks - runs daily at 2 AM
export const startArchiveCleanup = () => {
  const job = cron.schedule("0 2 * * *", async () => {
    try {
      console.log('[CRON] Cleaning up old archived tasks...');
      
      // Delete archived tasks older than 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const result = await Task.deleteMany({
        isArchived: true,
        updatedAt: { $lt: ninetyDaysAgo }
      });

      console.log(`[CRON] Deleted ${result.deletedCount} old archived tasks`);
    } catch (error) {
      console.error('[CRON] Error cleaning archived tasks:', error);
    }
  });

  console.log('[CRON] Archive cleanup started');
  return job;
};

// Send daily task summary - runs daily at 8 AM
export const startDailySummary = () => {
  const job = cron.schedule("0 8 * * *", async () => {
    try {
      console.log('[CRON] Generating daily task summaries...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find tasks due today
      const tasksDueToday = await Task.find({
        dueDate: { $gte: today, $lt: tomorrow },
        status: { $nin: ["completed"] },
        isArchived: false
      }).populate('assignedTo', 'email displayName');

      // Group by user
      const userTasks = {};
      tasksDueToday.forEach(task => {
        const userId = task.assignedTo._id.toString();
        if (!userTasks[userId]) {
          userTasks[userId] = {
            user: task.assignedTo,
            tasks: []
          };
        }
        userTasks[userId].tasks.push(task);
      });

      // Here you would send emails to users
      // For now, just log
      Object.values(userTasks).forEach(({ user, tasks }) => {
        console.log(`[CRON] User ${user.displayName} has ${tasks.length} tasks due today`);
        // TODO: Send email notification
      });

    } catch (error) {
      console.error('[CRON] Error sending daily summaries:', error);
    }
  });

  console.log('[CRON] Daily summary started');
  return job;
};

// Start all cron jobs
export const startAllCronJobs = () => {
  const jobs = {
    lateTaskChecker: startLateTaskChecker(),
    archiveCleanup: startArchiveCleanup(),
    dailySummary: startDailySummary()
  };

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[CRON] Stopping all cron jobs...');
    Object.values(jobs).forEach(job => job.stop());
  });

  return jobs;
}; 