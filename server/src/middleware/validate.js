const { z } = require("zod");

const registerCredentialsSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
  role: z.enum(["sicario", "fixer"]).default("sicario"),
});

const loginCredentialsSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
  role: z.enum(["sicario", "fixer"]).optional(),
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

const heistSchema = z.object({
  heading: z.string().trim().min(3).max(200),
  subheading: z.string().trim().min(3).max(200),
  quote: z.string().trim().max(500).optional().or(z.literal("")),
  timeline: z.string().trim().min(3).max(500),
  crew_moneyshare: z.string().trim().min(1).max(200),
  crew_threat_level: z.string().trim().min(1).max(100),
  photos: z.array(z.string().trim().url()).max(3),
  short_description: z.string().trim().min(10).max(2000),
  payout: z.coerce.number().int().nonnegative().default(0),
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
  validateRegisterCredentials,
  validateLoginCredentials,
  validateHeist,
};