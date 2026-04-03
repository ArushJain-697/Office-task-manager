const { z } = require("zod");

const credentialsSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
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

module.exports = {
  validateCredentials,
};
