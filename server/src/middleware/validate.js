const { z } = require("zod");

const registerCredentialsSchema = z.object({
  username: z.string().trim().min(2).max(100),
  password: z.string().min(2).max(128),
  role: z.enum(["sicario", "fixer"]).default("sicario"),
});

const loginCredentialsSchema = z.object({
  username: z.string().trim().min(2).max(100),
  password: z.string().min(2).max(128),
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

const timelineStepSchema = z.object({
  step: z.coerce.number().int().min(1).max(6),
  time: z.string().trim().min(1).max(20),
  desc: z.string().trim().min(1).max(500),
});

const crewMemberSchema = z.object({
  title: z.string().trim().min(1).max(200),
  job: z.string().trim().min(1).max(200),
  requirements: z.string().trim().min(1).max(200),
  threat_level: z.string().trim().min(1).max(100),
  money_share: z.string().trim().min(1).max(50),
});

const heistSchema = z.object({
  operation_name: z.string().trim().min(3).max(200),
  place: z.string().trim().min(1).max(200),
  target: z.string().trim().min(1).max(200),
  introduction: z.string().trim().min(10).max(3000),
  quote: z.string().trim().max(500).optional().or(z.literal("")),

  phase1_name: z.string().trim().min(1).max(200),
  phase1_description: z.string().trim().min(1).max(2000),
  intel_end_points_mapped: z.string().trim().min(1).max(500),
  intel_guard_rotations: z.string().trim().min(1).max(500),
  intel_surveillance_hours: z.string().trim().min(1).max(500),
  intel_vulnerabilities_found: z.string().trim().min(1).max(500),

  execution_description: z.string().trim().min(1).max(3000),
  timeline: z
    .array(timelineStepSchema)
    .min(1, { error: "Timeline must include at least one execution step" })
    .max(6, { error: "Timeline cannot exceed 6 execution steps" }),

  extraction_plan: z.string().trim().min(1).max(3000),

  crew_members: z.array(crewMemberSchema).min(1).max(3),
});

function validateHeist(req, res, next) {
  ["timeline", "crew_members"].forEach((key) => {
    if (typeof req.body[key] === "string") {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch {
        return res.status(400).json({ message: `${key} must be a valid JSON array` });
      }
    }
  });

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

const profileSchema = z.object({
  name: z.string().trim().max(200).optional(),
  title: z.string().trim().max(200).optional(),
  height: z.string().trim().max(50).optional(),
  weight: z.string().trim().max(50).optional(),
  languages: z.array(z.string().trim().min(1)).optional(),
  blood_group: z.string().trim().max(10).optional(),
  clearance_level: z.string().trim().max(100).optional(),
  about: z.string().trim().max(5000).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
});

function validateProfile(req, res, next) {
  ["skills", "languages"].forEach((key) => {
    if (typeof req.body[key] === "string") {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch {
      }
    }
  });

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid profile data",
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
  validateProfile,
};