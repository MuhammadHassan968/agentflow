/**
 * Canonical Domain Status Constants
 * Defining domain enums in a single module prevents typo bugs and makes state
 * transitions transparent and maintainable.
 */

export const GOAL_STATUS = {
  DRAFT: 'draft',
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  AT_RISK: 'at_risk',
  CANCELLED: 'cancelled',
};

export const TASK_STATUS = {
  PENDING: 'pending',        // Waiting for prerequisites or unstarted
  READY: 'ready',            // All dependencies are met; ready to be executed
  IN_PROGRESS: 'in_progress',// Actively being worked on
  BLOCKED: 'blocked',        // Explicitly hindered by an issue or blocked dependency
  COMPLETED: 'completed',    // Finished
  CANCELLED: 'cancelled',    // Abandoned or obsolete
};

export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  AT_RISK: 'at_risk',
  CRITICAL: 'critical',
};
