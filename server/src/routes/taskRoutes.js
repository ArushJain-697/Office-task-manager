const express = require("express");

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Tasks
 *     description: Task management
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         title: { type: string }
 *         description: { type: string, nullable: true }
 *         status: { type: string, enum: [pending, completed] }
 *         assigned_to: { type: integer, nullable: true }
 *         created_by: { type: integer }
 *         created_at: { type: string }
 */

const { requireAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/checkRole");
const { validateCreateTask, validateUpdateTask } = require("../middleware/validate");
const taskController = require("../controllers/taskController");

/**
 * @openapi
 * /api/v1/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task (admin)
 *     responses:
 *       201: { description: Task created }
 *   get:
 *     tags: [Tasks]
 *     summary: List all tasks (admin)
 *     responses:
 *       200: { description: OK }
 */
router.post("/", requireAuth, checkRole("admin"), validateCreateTask, taskController.createTask);
router.get("/", requireAuth, checkRole("admin"), taskController.listTasks);

/**
 * @openapi
 * /api/v1/tasks/my-tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List my assigned tasks (user)
 *     responses:
 *       200: { description: OK }
 */
router.get("/my-tasks", requireAuth, checkRole("user"), taskController.listMyTasks);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.put("/:id", requireAuth, checkRole("admin"), validateUpdateTask, taskController.updateTask);
router.delete("/:id", requireAuth, checkRole("admin"), taskController.deleteTask);

/**
 * @openapi
 * /api/v1/tasks/{id}/status:
 *   patch:
 *     tags: [Tasks]
 *     summary: Mark a task completed (admin or assigned user)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.patch("/:id/status", requireAuth, checkRole("admin", "user"), taskController.completeTask);

module.exports = router;

