"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Link,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

interface SocialLink {
  platform: string;
  link: string;
}

interface TryOutStats {
  highestSKD: number;
  averageSKD: number;
}

interface UserProfileData {
  avatar: string;
  username: string;
  email: string;
  phoneNumber: string;
  lastEducation: string;
  major: string;
  destinationInstitution: string;
  socialLinks: SocialLink[];
  tryOutStats: TryOutStats;
}


const useStyles = makeStyles((theme:any) => ({
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  },
  avatar: {
    width: theme.spacing(24),
    height: theme.spacing(24),
  },
}));

const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfileData> | null>(null);
  const classes = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/profile');
        if (response.status === 200) {
          setProfile(response.data);
        } else {
          throw new Error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
    setEditedProfile(profile);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = async () => {
    // Implement save changes logic here
    // Example: axios.post('/api/profile', editedProfile)
    setIsEditModalOpen(false);
    // Optionally, refetch profile data or update UI optimistically
  };

  const handleChange = (event:any) => {
    const { name, value } = event.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  if (!profile) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card className="mb-4 shadow-lg">
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar src={profile.avatar} alt={profile.username} className={classes.avatar} />
                <div>
                  <Typography variant="h5" className="text-lg font-bold">
                    {profile.username}
                  </Typography>
                  <Typography variant="subtitle1" className="text-gray-500">
                    {profile.email}
                  </Typography>
                </div>
              </div>
              <div className="flex mt-4">
                {profile.socialLinks?.map((link, index) => (
                  <Link key={index} href={link.link} target="_blank" rel="noopener noreferrer" className="mr-2">
                    <Avatar src={`/icons/${link.platform.toLowerCase()}.svg`} />
                  </Link>
                ))}
              </div>
              <Button variant="contained" onClick={handleEditClick} className="mt-4">
                Edit Data
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Other grid items for profile details */}
      </Grid>

      <Modal open={isEditModalOpen} onClose={handleModalClose}>
        <Box sx={classes.modalBox}>
          <Typography variant="h6" gutterBottom>
            Edit Data
          </Typography>
          <form noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={editedProfile?.username || ''}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={editedProfile?.email || ''}
              onChange={handleChange}
              margin="normal"
            />
            {/* Add other fields as necessary */}
            <Button onClick={handleSaveChanges} variant="contained" color="primary" className="mt-4">
              Save Changes
            </Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default UserProfile;
