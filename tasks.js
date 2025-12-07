const express = require('express');
const Task = require('../models/Task');

const router = express.Router();
const VALID_STATUSES = ['Pending', 'Completed'];

// POST /api/tasks - create a new task
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const task = await Task.create({ title: title.trim(), description, status });
    return res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err.message);
    return res.status(500).json({ message: 'Failed to create task' });
  }
});

// GET /api/tasks - get all tasks (optionally filtered by status)
router.get('/', async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && VALID_STATUSES.includes(status)) {
    filter.status = status;
  }

  try {
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    return res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// PUT /api/tasks/:id - update a task
router.put('/:id', async (req, res) => {
  const { title, description, status } = req.body;
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updates = {};
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      updates.title = title.trim();
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (status) {
      updates.status = status;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (err) {
    console.error('Error updating task:', err.message);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    return res.status(500).json({ message: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    return res.status(500).json({ message: 'Failed to delete task' });
  }
});

module.exports = router;
