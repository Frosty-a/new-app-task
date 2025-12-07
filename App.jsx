import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, CheckCircleOutline, Delete, Edit, Replay } from '@mui/icons-material';
import { createTask, deleteTask, fetchTasks, updateTask } from './api';

const initialForm = { title: '', description: '' };

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await fetchTasks(statusFilter === 'All' ? undefined : statusFilter);
      setTasks(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    return { completed, pending: tasks.length - completed, total: tasks.length };
  }, [tasks]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setSnackbar({ open: true, message: 'Title is required', severity: 'warning' });
      return;
    }

    try {
      if (editingId) {
        const { data } = await updateTask(editingId, form);
        setTasks((prev) => prev.map((t) => (t._id === editingId ? data : t)));
        setSnackbar({ open: true, message: 'Task updated', severity: 'success' });
      } else {
        const { data } = await createTask(form);
        setTasks((prev) => [data, ...prev]);
        setSnackbar({ open: true, message: 'Task added', severity: 'success' });
      }
      setForm(initialForm);
      setEditingId(null);
    } catch (err) {
      setSnackbar({ open: true, message: 'Save failed', severity: 'error' });
    }
  };

  const handleEdit = (task) => {
    setForm({ title: task.title, description: task.description || '' });
    setEditingId(task._id);
  };

  const handleCancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setSnackbar({ open: true, message: 'Task deleted', severity: 'info' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      const { data } = await updateTask(task._id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? data : t)));
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    }
  };

  const statusChipColor = (status) => (status === 'Completed' ? 'success' : 'warning');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Task Manager
          </Typography>
          <Typography color="text.secondary">Track, filter, and update your tasks in real time.</Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant="h6">{editingId ? 'Edit Task' : 'Add Task'}</Typography>
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {editingId && (
                <Button variant="text" color="secondary" onClick={handleCancelEdit} disabled={loading}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                startIcon={editingId ? <Edit /> : <Add />}
                disabled={loading}
              >
                {editingId ? 'Update Task' : 'Add Task'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="status-filter-label">Filter by status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Filter by status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Chip label={`Total: ${stats.total}`} color="primary" />
              <Chip label={`Pending: ${stats.pending}`} color="warning" />
              <Chip label={`Completed: ${stats.completed}`} color="success" />
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="22%">Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell width="12%">Status</TableCell>
                <TableCell width="18%">Created</TableCell>
                <TableCell width="16%" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No tasks yet. Add one to get started.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {tasks.map((task) => (
                <TableRow key={task._id} hover>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description || '-'}</TableCell>
                  <TableCell>
                    <Chip label={task.status} color={statusChipColor(task.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title={task.status === 'Pending' ? 'Mark complete' : 'Mark pending'}>
                        <IconButton color="success" onClick={() => handleToggleStatus(task)} size="small">
                          {task.status === 'Pending' ? <CheckCircleOutline /> : <Replay />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(task)} size="small">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(task._id)} size="small">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>

      <Divider sx={{ my: 3 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        Powered by React, Express, and MongoDB.
      </Typography>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
