import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useGetAnnouncementsQuery } from '../api/announcementApi';
import CreateAnnouncementModal from './CreateAnnouncementModal';

const AnnouncementDashboard: React.FC = () => {
  const { data: announcements, isLoading } = useGetAnnouncementsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXAM': return 'error';
      case 'ABSENCE': return 'warning';
      case 'INFO': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Announcements
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          New Announcement
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Target Audience</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading...</TableCell>
              </TableRow>
            ) : announcements?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No announcements sent yet.</TableCell>
              </TableRow>
            ) : (
              announcements?.map((announcement) => (
                <TableRow key={announcement.id} hover>
                  <TableCell>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {announcement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                      {announcement.content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={announcement.type} color={getTypeColor(announcement.type) as any} size="small" />
                  </TableCell>
                  <TableCell>
                    {announcement.program && announcement.level ? (
                      <Typography variant="body2">
                        {announcement.program.name} - {announcement.level.name}
                      </Typography>
                    ) : (
                      <Chip label="All My Students" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateAnnouncementModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
};

export default AnnouncementDashboard;
