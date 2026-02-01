// Halaman Projects - Manajemen proyek dan tugas
import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  CheckCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Clock,
  Search,
} from 'lucide-react';
import { projectsApi } from '../../services/api';
import {
  Button,
  Input,
  Select,
  Textarea,
  Modal,
  Card,
  StatCard,
  StatusBadge,
  PriorityBadge,
} from '../../components/ui';

interface ProjectsProps {
  token: string;
  userRole: string;
}

export const Projects: React.FC<ProjectsProps> = ({ userRole }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    statusCounts: {} as Record<string, number>,
    priorityCounts: {} as Record<string, number>,
    taskStats: { total: 0, completed: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: 0,
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, statsData] = await Promise.all([
        projectsApi.getAll({ status: statusFilter || undefined }),
        projectsApi.getStats(),
      ]);
      setProjects(projectsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectsApi.update(editingProject._id, projectForm);
      } else {
        await projectsApi.create(projectForm);
      }
      setIsProjectModalOpen(false);
      resetProjectForm();
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Operasi gagal');
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await projectsApi.addTask(selectedProject._id, taskForm);
      setIsTaskModalOpen(false);
      resetTaskForm();
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Gagal menambah tugas');
    }
  };

  const handleToggleTask = async (projectId: string, taskId: string) => {
    try {
      await projectsApi.toggleTask(projectId, taskId);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Gagal mengubah status tugas');
    }
  };

  const handleDeleteTask = async (projectId: string, taskId: string) => {
    if (!confirm('Hapus tugas ini?')) return;
    try {
      await projectsApi.deleteTask(projectId, taskId);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus tugas');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;
    try {
      await projectsApi.delete(id);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus proyek');
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      budget: project.budget || 0,
    });
    setIsProjectModalOpen(true);
  };

  const resetProjectForm = () => {
    setEditingProject(null);
    setProjectForm({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: 0,
    });
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    });
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const canManageProjects = userRole === 'admin' || userRole === 'manager';
  const isStaff = userRole === 'staff';

  return (
    <div className="p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Briefcase className="text-purple-600" /> Proyek & Tugas
          </h2>
          {isStaff && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              Hanya Lihat & Update Tugas
            </span>
          )}
        </div>
        {canManageProjects && (
          <Button
            onClick={() => {
              resetProjectForm();
              setIsProjectModalOpen(true);
            }}
            icon={<Plus size={18} />}
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          >
            Proyek Baru
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Proyek"
          value={stats.totalProjects}
          icon={<Briefcase size={24} />}
          color="purple"
        />
        <StatCard
          title="Aktif"
          value={stats.statusCounts?.active || 0}
          icon={<Clock size={24} />}
          color="green"
        />
        <StatCard
          title="Tugas Selesai"
          value={`${stats.taskStats.completed}/${stats.taskStats.total}`}
          icon={<CheckCircle size={24} />}
          color="blue"
        />
        <StatCard
          title="Selesai"
          value={stats.statusCounts?.completed || 0}
          icon={<CheckCircle size={24} />}
          color="green"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 sm:items-center">
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <Input
              placeholder="Cari proyek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'planning', label: 'Perencanaan' },
              { value: 'active', label: 'Aktif' },
              { value: 'on-hold', label: 'Ditunda' },
              { value: 'completed', label: 'Selesai' },
              { value: 'cancelled', label: 'Dibatalkan' },
            ]}
            className="w-full sm:w-40"
          />
        </div>
      </Card>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-md transition group"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={project.status} />
                  {canManageProjects && (
                    <div className="relative group/menu">
                      <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 hidden group-hover/menu:block z-10 min-w-[120px]">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 size={14} /> Ubah
                        </button>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority & Progress */}
              <div className="flex items-center justify-between mb-4">
                <PriorityBadge priority={project.priority} />
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {project.progress}%
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase">
                  Tugas ({project.tasks.filter((t: any) => t.done).length}/
                  {project.tasks.length})
                </h4>
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Belum ada tugas yang ditugaskan.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {project.tasks.slice(0, 5).map((task: any) => (
                      <div
                        key={task._id}
                        className="flex items-center gap-3 text-sm group/task"
                      >
                        <button
                          onClick={() =>
                            handleToggleTask(project._id, task._id)
                          }
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                            task.done
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-purple-500'
                          }`}
                        >
                          {task.done && (
                            <CheckCircle size={12} className="text-white" />
                          )}
                        </button>
                        <span
                          className={`flex-1 ${
                            task.done
                              ? 'line-through text-gray-400'
                              : 'text-gray-700'
                          }`}
                        >
                          {task.title}
                        </span>
                        {canManageProjects && (
                          <button
                            onClick={() =>
                              handleDeleteTask(project._id, task._id)
                            }
                            className="opacity-0 group-hover/task:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {project.tasks.length > 5 && (
                      <p className="text-xs text-gray-400">
                        +{project.tasks.length - 5} tugas lainnya
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Add Task Button - Only for admin/manager */}
              {canManageProjects && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-purple-600 hover:bg-purple-50"
                  onClick={() => {
                    setSelectedProject(project);
                    resetTaskForm();
                    setIsTaskModalOpen(true);
                  }}
                  icon={<Plus size={14} />}
                >
                  Tambah Tugas
                </Button>
              )}
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Proyek tidak ditemukan.
            </div>
          )}
        </div>
      )}

      {/* Project Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          resetProjectForm();
        }}
        title={editingProject ? 'Ubah Proyek' : 'Buat Proyek Baru'}
        size="lg"
      >
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <Input
            label="Judul Proyek"
            required
            value={projectForm.title}
            onChange={(e) =>
              setProjectForm({ ...projectForm, title: e.target.value })
            }
          />
          <Textarea
            label="Deskripsi"
            rows={3}
            value={projectForm.description}
            onChange={(e) =>
              setProjectForm({ ...projectForm, description: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={projectForm.status}
              onChange={(e) =>
                setProjectForm({ ...projectForm, status: e.target.value })
              }
              options={[
                { value: 'planning', label: 'Perencanaan' },
                { value: 'active', label: 'Aktif' },
                { value: 'on-hold', label: 'Ditunda' },
                { value: 'completed', label: 'Selesai' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ]}
            />
            <Select
              label="Prioritas"
              value={projectForm.priority}
              onChange={(e) =>
                setProjectForm({ ...projectForm, priority: e.target.value })
              }
              options={[
                { value: 'low', label: 'Rendah' },
                { value: 'medium', label: 'Sedang' },
                { value: 'high', label: 'Tinggi' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={projectForm.startDate}
              onChange={(e) =>
                setProjectForm({ ...projectForm, startDate: e.target.value })
              }
            />
            <Input
              label="Tanggal Selesai"
              type="date"
              value={projectForm.endDate}
              onChange={(e) =>
                setProjectForm({ ...projectForm, endDate: e.target.value })
              }
            />
          </div>
          <Input
            label="Anggaran (Rp)"
            type="number"
            min={0}
            value={projectForm.budget}
            onChange={(e) =>
              setProjectForm({
                ...projectForm,
                budget: parseFloat(e.target.value) || 0,
              })
            }
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {editingProject ? 'Perbarui Proyek' : 'Buat Proyek'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsProjectModalOpen(false);
                resetProjectForm();
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          resetTaskForm();
        }}
        title={`Tambah Tugas ke ${selectedProject?.title || 'Proyek'}`}
        size="md"
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Input
            label="Judul Tugas"
            required
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
          />
          <Textarea
            label="Deskripsi"
            rows={2}
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({ ...taskForm, description: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Prioritas"
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm({ ...taskForm, priority: e.target.value })
              }
              options={[
                { value: 'low', label: 'Rendah' },
                { value: 'medium', label: 'Sedang' },
                { value: 'high', label: 'Tinggi' },
              ]}
            />
            <Input
              label="Tenggat Waktu"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) =>
                setTaskForm({ ...taskForm, dueDate: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Tambah Tugas
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsTaskModalOpen(false);
                resetTaskForm();
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
