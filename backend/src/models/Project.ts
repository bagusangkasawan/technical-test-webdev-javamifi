// Model Project - Skema data proyek dan tugas dengan progress otomatis
import mongoose, { Schema, Document } from 'mongoose';

export interface ITask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assignee?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate?: Date;
  done: boolean;
  createdAt: Date;
}

export interface IProject extends Document {
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  manager?: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  tasks: ITask[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
    dueDate: { type: Date },
    done: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tasks: [TaskSchema],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate progress before saving
ProjectSchema.pre('save', function (next) {
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter((t) => t.done).length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  } else {
    this.progress = 0;
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
