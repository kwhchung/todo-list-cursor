import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  TableCell,
  TableRow
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface Tag {
  _id: string;
  name: string;
  color?: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  tags?: Tag[];
  completed?: boolean;
}

interface Tab {
  _id: string;
  name: string;
  filterTags: string[];
  sortBy: 'dueDate' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  filterMode: 'AND' | 'OR';
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchTabs();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TASKS);
      setTasks(response.data);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const fetchTabs = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TABS);
      setTabs(response.data);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_ENDPOINTS.TASKS}/${id}`);
      fetchTasks();
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'completed') => {
    try {
      await axios.put(`${API_ENDPOINTS.TASKS}/${id}`, { completed: status === 'completed' });
      fetchTasks();
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    if (newValue !== 'all') {
      const tab = tabs.find(t => t._id === newValue);
      if (tab) {
        setSortBy(tab.sortBy);
        setSortOrder(tab.sortOrder);
      }
    }
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as 'dueDate' | 'createdAt');
  };

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  };

  const filteredTasks = tasks.filter(task => {
    if (!currentTab) return true;
    const tab = tabs.find(t => t._id === currentTab);
    if (!tab) return true;

    if (!task.tags || task.tags.length === 0) {
      return false;
    }

    const taskTagNames = task.tags.map(tag => tag.name);
    
    if (tab.filterMode === 'AND') {
      return tab.filterTags.every(tagName => taskTagNames.includes(tagName));
    } else {
      return tab.filterTags.some(tagName => taskTagNames.includes(tagName));
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aValue = sortBy === 'dueDate' ? a.dueDate : a._id;
    const bValue = sortBy === 'dueDate' ? b.dueDate : b._id;
    if (!aValue || !bValue) return 0;
    return sortOrder === 'asc'
      ? new Date(aValue).getTime() - new Date(bValue).getTime()
      : new Date(bValue).getTime() - new Date(aValue).getTime();
  });

  const getDueDateDisplay = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    
    if (date < now) {
      return `Overdue by ${formatDistanceToNow(date)}`;
    }
    return `Due in ${formatDistanceToNow(date)}`;
  };

  const hasExpandableContent = (task: Task) => {
    return Boolean(task.description || task.dueDate || (task.tags && task.tags.length > 0));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="All" value="all" />
          {tabs.map(tab => (
            <Tab key={tab._id} label={tab.name} value={tab._id} />
          ))}
        </Tabs>
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="createdAt">Created At</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select value={sortOrder} label="Order" onChange={handleSortOrderChange}>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
          >
            New Task
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {sortedTasks.map(task => (
          <Accordion 
            key={task._id}
            expanded={hasExpandableContent(task) ? undefined : false}
            onChange={(e, expanded) => {
              // Prevent expansion if the click was on the checkbox
              if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
                e.stopPropagation();
                return;
              }
              // Prevent expansion for tasks without expandable content
              if (!hasExpandableContent(task)) {
                e.preventDefault();
              }
            }}
            sx={{
              '&.MuiAccordion-root': {
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '4px',
                '&:before': {
                  display: 'none',
                },
              }
            }}
          >
            <AccordionSummary
              expandIcon={hasExpandableContent(task) ? <ExpandMoreIcon /> : null}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <FormControlLabel
                  onClick={(e) => e.stopPropagation()}
                  control={
                    <Checkbox
                      checked={task.completed}
                      onChange={(e) => handleStatusChange(task._id, e.target.checked ? 'completed' : 'pending')}
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {task.title}
                      </Typography>
                      {task.tags && task.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {task.tags
                            .sort((a, b) => {
                              // Sort predefined tags to the front
                              if (a.name === 'done' || a.name === 'due') return -1;
                              if (b.name === 'done' || b.name === 'due') return 1;
                              return 0;
                            })
                            .map(tag => (
                              <Chip
                                key={tag._id}
                                label={tag.name}
                                size="small"
                                sx={{ 
                                  height: '20px',
                                  backgroundColor: tag.color || 'primary.light',
                                  color: 'white',
                                  '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: '0.75rem'
                                  }
                                }}
                              />
                            ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
                {task.dueDate && (
                  <Typography
                    variant="body2"
                    color={new Date(task.dueDate) < new Date() ? 'error' : 'text.secondary'}
                    sx={{ ml: 2 }}
                  >
                    {getDueDateDisplay(task.dueDate)}
                  </Typography>
                )}
              </Box>
              <Box>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tasks/${task._id}`);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task._id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </AccordionSummary>
            {hasExpandableContent(task) && (
              <AccordionDetails>
                <Box sx={{ pl: 4 }}>
                  {task.description && (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                  )}
                  {task.dueDate && (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Exact due date: {format(new Date(task.dueDate), 'PPpp')}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            )}
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
};

export default TaskList; 