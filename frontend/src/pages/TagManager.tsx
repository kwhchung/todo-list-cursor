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
  Chip,
  Typography,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface Tag {
  _id: string;
  name: string;
  color?: string;
  isPredefined: boolean;
}

interface TagUsage {
  tag: Tag;
  taskCount: number;
  tasks: Array<{
    _id: string;
    title: string;
  }>;
}

const TagManager: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#808080'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [tagUsage, setTagUsage] = useState<TagUsage | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TAGS);
      // Sort tags to put predefined ones at the front
      const sortedTags = response.data.sort((a: Tag, b: Tag) => {
        if (a.isPredefined && !b.isPredefined) return -1;
        if (!a.isPredefined && b.isPredefined) return 1;
        return 0;
      });
      setTags(sortedTags);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleOpen = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        color: tag.color || '#808080'
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        color: '#808080'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTag(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await axios.put(`${API_ENDPOINTS.TAGS}/${editingTag._id}`, formData);
      } else {
        await axios.post(API_ENDPOINTS.TAGS, formData);
      }
      fetchTags();
      handleClose();
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleDeleteClick = async (tag: Tag) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.TAGS}/${tag._id}/usage`);
      setTagUsage(response.data);
      setTagToDelete(tag);
      setDeleteDialogOpen(true);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      await axios.delete(`${API_ENDPOINTS.TAGS}/${tagToDelete._id}`);
      fetchTags();
      setDeleteDialogOpen(false);
      setTagToDelete(null);
      setTagUsage(null);
    } catch (error) {
      // Error handling without console.error
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTagToDelete(null);
    setTagUsage(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen()}>
          New Tag
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag._id}>
                <TableCell>{tag.name}</TableCell>
                <TableCell>
                  <Chip
                    label={tag.color}
                    sx={{ backgroundColor: tag.color, color: 'white' }}
                  />
                </TableCell>
                <TableCell>{tag.isPredefined ? 'Predefined' : 'Custom'}</TableCell>
                <TableCell>
                  {!tag.isPredefined && (
                    <>
                      <IconButton onClick={() => handleOpen(tag)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(tag)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingTag ? 'Edit Tag' : 'New Tag'}
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
            <TextField
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, color: e.target.value })}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the tag "{tagToDelete?.name}"?
          </Typography>
          {tagUsage && tagUsage.taskCount > 0 && (
            <>
              <Typography variant="body1" color="warning.main" sx={{ mb: 2 }}>
                Warning: This tag is used in {tagUsage.taskCount} task(s). Deleting this tag will remove it from all tasks.
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Affected tasks:
              </Typography>
              <List dense>
                {tagUsage.tasks.map((task) => (
                  <ListItem key={task._id}>
                    <ListItemText primary={task.title} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagManager; 