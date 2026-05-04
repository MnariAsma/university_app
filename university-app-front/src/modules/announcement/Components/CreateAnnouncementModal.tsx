import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
} from '@mui/material';
import { useCreateAnnouncementMutation } from '../api/announcementApi';
import { useGetProgramsQuery, useGetLevelsQuery } from '../../grade/Apis/GradeApi';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateAnnouncementModal: React.FC<Props> = ({ open, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('INFO');
  const [targetType, setTargetType] = useState('ALL'); // 'ALL' | 'SPECIFIC'
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

  const { data: programs } = useGetProgramsQuery(undefined, { skip: targetType !== 'SPECIFIC' });
  const { data: levels } = useGetLevelsQuery(selectedProgram, { skip: !selectedProgram || targetType !== 'SPECIFIC' });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setContent('');
      setType('INFO');
      setTargetType('ALL');
      setSelectedProgram('');
      setSelectedLevel('');
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      await createAnnouncement({
        title,
        content,
        type,
        targetProgramId: targetType === 'SPECIFIC' && selectedProgram ? selectedProgram : undefined,
        targetLevelId: targetType === 'SPECIFIC' && selectedLevel ? selectedLevel : undefined,
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to create announcement', error);
      alert('Failed to send announcement');
    }
  };

  const isFormValid = () => {
    if (!title || !content) return false;
    if (targetType === 'SPECIFIC' && (!selectedProgram || !selectedLevel)) return false;
    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Announcement</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as string)}
            >
              <MenuItem value="INFO">General Information</MenuItem>
              <MenuItem value="ABSENCE">Absence / Cancellation</MenuItem>
              <MenuItem value="EXAM">Exam Details</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Target Audience
            </Typography>
            <RadioGroup
              row
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                if (e.target.value === 'ALL') {
                  setSelectedProgram('');
                  setSelectedLevel('');
                }
              }}
            >
              <FormControlLabel value="ALL" control={<Radio />} label="All My Students" />
              <FormControlLabel value="SPECIFIC" control={<Radio />} label="Specific Program & Level" />
            </RadioGroup>
          </Box>

          {targetType === 'SPECIFIC' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Program</InputLabel>
                <Select
                  value={selectedProgram}
                  label="Program"
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setSelectedLevel('');
                  }}
                >
                  {programs?.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!selectedProgram}>
                <InputLabel>Level</InputLabel>
                <Select
                  value={selectedLevel}
                  label="Level"
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  {levels?.map((l: any) => (
                    <MenuItem key={l.id} value={l.id}>
                      {l.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAnnouncementModal;
