import React, { ReactNode } from 'react'
import ArtTrackIcon from '@mui/icons-material/ArtTrack'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ForumIcon from '@mui/icons-material/Forum';
import LaptopIcon from '@mui/icons-material/Laptop';
import TimelineIcon from '@mui/icons-material/Timeline';
import QuizIcon from '@mui/icons-material/Quiz';

interface Data {
  title: string
  description: string
  icon?: ReactNode
}

export const data: Data[] = [
  {
    title: 'Perangkingan Nasional ',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    icon: <MilitaryTechIcon />,
  },
  {
    title: 'Pembahasan Soal',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    icon: <ForumIcon />,
  },
  {
    title: 'Manajemen Waktu',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    icon: <LocalLibraryIcon />,
  },
  {
    title: 'Sistem CAT',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    icon: <LaptopIcon />,
  },
  {
    title: 'Akses Belajar Fleksibel',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    icon: <TimelineIcon />,
  },
  {
    title: 'Soal Berstandar HOTS',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    icon: <QuizIcon />,
  },
]
