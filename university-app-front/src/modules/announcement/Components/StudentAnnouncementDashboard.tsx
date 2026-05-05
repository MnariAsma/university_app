import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  useTheme,
  Grid,
} from "@mui/material";
import {
  Announcement as AnnouncementIcon,
  Description,
  CalendarToday,
  Person,
  Business,
} from "@mui/icons-material";
import { useGetStudentAnnouncementsQuery } from "../api/announcementApi";

const StudentAnnouncementDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: announcements = [], isLoading } = useGetStudentAnnouncementsQuery();

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (tabIndex === 0) return true;
    if (tabIndex === 1) return a.source === "TEACHER";
    if (tabIndex === 2) return a.source === "ADMIN";
    return true;
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto", height: "100%", display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? "primary.dark" : "primary.light",
            color: isDark ? "primary.contrastText" : "primary.main",
          }}
        >
          <AnnouncementIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with the latest news from teachers and administration
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "transparent",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All" sx={{ fontWeight: 600, textTransform: "none" }} />
          <Tab label="Teachers" sx={{ fontWeight: 600, textTransform: "none" }} />
          <Tab label="Administration" sx={{ fontWeight: 600, textTransform: "none" }} />
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, overflowY: "auto", pb: 2 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography color="text.secondary">Loading announcements...</Typography>
          </Box>
        ) : filteredAnnouncements.length > 0 ? (
          <Grid container spacing={3}>
            {filteredAnnouncements.map((announcement: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={announcement.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: isDark
                        ? "0 4px 20px rgba(56, 189, 248, 0.15)"
                        : "0 4px 20px rgba(37, 99, 235, 0.12)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 4,
                      bgcolor:
                        announcement.source === "TEACHER"
                          ? "primary.main"
                          : "warning.main",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, flex: 1, mr: 2 }}>
                        {announcement.title}
                      </Typography>
                      <Chip
                        label={announcement.type}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 24,
                          bgcolor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.05)",
                          color: "text.secondary",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {announcement.content}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {announcement.source === "TEACHER" ? (
                          <Person sx={{ fontSize: 16, color: "primary.main" }} />
                        ) : (
                          <Business sx={{ fontSize: 16, color: "warning.main" }} />
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {announcement.author}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.disabled" }}>
                        <CalendarToday sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Description sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              No announcements found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Check back later for updates.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StudentAnnouncementDashboard;
