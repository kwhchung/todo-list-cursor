import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  SelectChangeEvent
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface Tab {
  _id: string;
  name: string;
  filterTags: string[];
  sortBy: 'dueDate' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  filterMode: 'AND' | 'OR';
  isDefault: boolean;
}

interface Tag {
  _id: string;
  name: string;
  group?: string;
  color?: string;
}

const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    filterTags: [] as string[],
    sortBy: 'dueDate' as 'dueDate' | 'createdAt',
    sortOrder: 'asc' as 'asc' | 'desc',
    filterMode: 'OR' as 'AND' | 'OR',
    isDefault: false
  });

  useEffect(() => {
    fetchTabs();
    fetchTags();
  }, []);

  const fetchTabs = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TABS);
      setTabs(response.data);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TAGS);
      setTags(response.data);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleOpen = (tab?: Tab) => {
    if (tab) {
      setEditingTab(tab);
      setFormData({
        name: tab.name,
        filterTags: tab.filterTags,
        sortBy: tab.sortBy,
        sortOrder: tab.sortOrder,
        filterMode: tab.filterMode || 'OR',
        isDefault: tab.isDefault
      });
    } else {
      setEditingTab(null);
      setFormData({
        name: '',
        filterTags: [],
        sortBy: 'dueDate',
        sortOrder: 'asc',
        filterMode: 'OR',
        isDefault: false
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTab(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingTab) {
        await axios.put(`${API_ENDPOINTS.TABS}/${editingTab._id}`, formData);
      } else {
        await axios.post(API_ENDPOINTS.TABS, formData);
      }
      fetchTabs();
      handleClose();
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_ENDPOINTS.TABS}/${id}`);
      fetchTabs();
    } catch (error) {
      // Error handling without console.error
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen()}>
          New Tab
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Filter Tags</TableCell>
              <TableCell>Filter Mode</TableCell>
              <TableCell>Sort By</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell>Default</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tabs.map((tab) => (
              <TableRow key={tab._id}>
                <TableCell>{tab.name}</TableCell>
                <TableCell>
                  {tab.filterTags.map((tagName) => {
                    const tag = tags.find(t => t.name === tagName);
                    return (
                      <Chip
                        key={tagName}
                        label={tagName}
                        size="small"
                        sx={{ 
                          mr: 1, 
                          mb: 1,
                          backgroundColor: tag?.color || 'primary.light',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: tag?.color || 'primary.main',
                          }
                        }}
                      />
                    );
                  })}
                </TableCell>
                <TableCell>{tab.filterMode || 'OR'}</TableCell>
                <TableCell>{tab.sortBy}</TableCell>
                <TableCell>{tab.sortOrder}</TableCell>
                <TableCell>{tab.isDefault ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(tab)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(tab._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingTab ? 'Edit Tab' : 'New Tab'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <Autocomplete
              multiple
              options={tags.map(tag => tag.name)}
              value={formData.filterTags}
              onChange={(_: React.SyntheticEvent, newValue: string[]) => setFormData({ ...formData, filterTags: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const tag = tags.find(t => t.name === option);
                  return (
                    <Chip
                      {...getTagProps({ index })}
                      label={option}
                      size="small"
                      sx={{ 
                        backgroundColor: tag?.color || 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: tag?.color || 'primary.main',
                        }
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter Tags"
                  placeholder="Select tags"
                />
              )}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Filter Mode</InputLabel>
              <Select
                value={formData.filterMode}
                label="Filter Mode"
                onChange={(e: SelectChangeEvent) => setFormData({ ...formData, filterMode: e.target.value as 'AND' | 'OR' })}
              >
                <MenuItem value="AND">All Tags (AND)</MenuItem>
                <MenuItem value="OR">Any Tag (OR)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={formData.sortBy}
                label="Sort By"
                onChange={(e: SelectChangeEvent) => setFormData({ ...formData, sortBy: e.target.value as 'dueDate' | 'createdAt' })}
              >
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="createdAt">Created At</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={formData.sortOrder}
                label="Sort Order"
                onChange={(e: SelectChangeEvent) => setFormData({ ...formData, sortOrder: e.target.value as 'asc' | 'desc' })}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTab ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TabManager; 