const { z } = require("zod");

const registerCredentialsSchema = z.object({
  username: z.string().trim().min(2).max(100),
  password: z.string().min(2).max(128),
});

const loginCredentialsSchema = z.object({
  username: z.string().trim().min(2).max(100),
  password: z.string().min(2).max(128),
});

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  assigned_to: z.number().int().positive().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).optional().nullable(),
  status: z.enum(["pending", "completed"]).optional(),
  assigned_to: z.number().int().positive().optional().nullable(),
});

function validateRegisterCredentials(req, res, next) {
  const parsed = registerCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = parsed.data;
  return next();
}

function validateLoginCredentials(req, res, next) {
  const parsed = loginCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = parsed.data;
  return next();
}

function validateCreateTask(req, res, next) {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = parsed.data;
  return next();
}

function validateUpdateTask(req, res, next) {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const hasAnyField = Object.keys(parsed.data).some((k) => parsed.data[k] !== undefined);
  if (!hasAnyField) {
    return res.status(400).json({ message: "At least one field must be provided." });
  }

  req.body = parsed.data;
  return next();
}

module.exports = {
  validateRegisterCredentials,
  validateLoginCredentials,
  validateCreateTask,
  validateUpdateTask,
};