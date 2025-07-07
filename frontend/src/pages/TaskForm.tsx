import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Autocomplete
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface Task {
  _id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  tags: Tag[];
}

interface Tag {
  _id: string;
  name: string;
  group?: string;
  color?: string;
  isPredefined: boolean;
}

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task>({
    title: '',
    description: '',
    tags: []
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags();
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.TASKS}/${id}`);
      setTask(response.data);
      setSelectedTags(response.data.tags);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TAGS);
      // Filter out predefined tags
      const customTags = response.data.filter((tag: Tag) => !tag.isPredefined);
      setTags(customTags);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        ...task,
        tags: selectedTags.map(tag => tag._id)
      };

      if (id) {
        await axios.put(`${API_ENDPOINTS.TASKS}/${id}`, taskData);
      } else {
        await axios.post(API_ENDPOINTS.TASKS, taskData);
      }
      navigate('/');
    } catch (error) {
      // Error handling without console.error
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {id ? 'Edit Task' : 'New Task'}
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Title"
          value={task.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTask({ ...task, title: e.target.value })}
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={task.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTask({ ...task, description: e.target.value })}
          multiline
          rows={4}
          fullWidth
        />

        <DateTimePicker
          label="Due Date"
          value={task.dueDate ? new Date(task.dueDate) : null}
          onChange={(date: Date | null) => setTask({ ...task, dueDate: date?.toISOString() })}
          slotProps={{ textField: { fullWidth: true } }}
        />

        <Autocomplete
          multiple
          options={tags}
          getOptionLabel={(option: Tag) => option.name}
          value={selectedTags}
          onChange={(_: React.SyntheticEvent, newValue: Tag[]) => setSelectedTags(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tags"
              placeholder="Select tags"
            />
          )}
          renderTags={(value: Tag[]) =>
            value.map((option: Tag) => (
              <Chip
                key={option._id}
                label={option.name}
                sx={{ backgroundColor: option.color }}
              />
            ))
          }
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!task.title}
          >
            {id ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default TaskForm; 