// Controller Project - Handler untuk manajemen proyek dan tugas
import { Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models';
import { AuthRequest } from '../middleware';

export const getAllProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, search } = req.query;
    
    let query: any = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    const projects = await Project.find(query)
      .populate('manager', 'name email')
      .populate('team', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get project by ID
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('team', 'name email')
      .populate('tasks.assignee', 'name email');
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Create project
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, startDate, endDate, budget, manager, team } = req.body;

    const project = new Project({
      title,
      description,
      status: status || 'planning',
      priority: priority || 'medium',
      startDate,
      endDate,
      budget,
      manager: manager || req.user?._id,
      team: team || [],
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update project
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, startDate, endDate, budget, manager, team } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, startDate, endDate, budget, manager, team },
      { new: true }
    );
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Add task to project
export const addTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, assignee, priority, dueDate } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const newTask = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      assignee,
      priority: priority || 'medium',
      status: 'todo' as const,
      dueDate,
      done: false,
      createdAt: new Date(),
    };

    project.tasks.push(newTask);
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add task' });
  }
};

// Update task
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, assignee, priority, status, dueDate, done } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const task = project.tasks.find((t) => t._id?.toString() === taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (done !== undefined) task.done = done;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, taskId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    project.tasks = project.tasks.filter((t) => t._id?.toString() !== taskId);
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Toggle task completion
export const toggleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, taskId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const task = project.tasks.find((t) => t._id?.toString() === taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    task.done = !task.done;
    task.status = task.done ? 'done' : 'todo';
    
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task' });
  }
};

// Get project stats
export const getProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalProjects, statusCounts, priorityCounts] = await Promise.all([
      Project.countDocuments(),
      Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Project.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    // Calculate total tasks stats
    const taskStats = await Project.aggregate([
      { $unwind: '$tasks' },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$tasks.done', 1, 0] } },
        },
      },
    ]);

    res.json({
      totalProjects,
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
      priorityCounts: Object.fromEntries(priorityCounts.map((p) => [p._id, p.count])),
      taskStats: taskStats[0] || { total: 0, completed: 0 },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project stats' });
  }
};
