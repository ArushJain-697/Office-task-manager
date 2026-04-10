const { z } = require("zod");

const credentialsSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
  role: z.enum(["mercenary", "fixer"]).default("mercenary"),
});

function validateCredentials(req, res, next) {
  const parsed = credentialsSchema.safeParse(req.body);
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

const heistSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10),
  required_skills: z.array(z.string().trim().min(1)).min(1),
});

function validateHeist(req, res, next) {
  const parsed = heistSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid heist data",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.body = parsed.data;
  return next();
}

module.exports = {
  validateCredentials,
  validateHeist,
};