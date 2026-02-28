import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Clean up expired typing statuses every minute
crons.interval(
  "cleanup typing statuses",
  { minutes: 1 },
  internal.scheduled.cleanupExpiredTypingStatuses
)

export default crons
