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
    description: 'Ukur kemampuanmu di tingkat nasional dan lihat dimana kamu berdiri di antara ribuan peserta.',
    icon: <MilitaryTechIcon />,
  },
  {
    title: 'Pembahasan Soal',
    description: 'Pahami konsep di balik soal dengan pembahasan mendetail untuk setiap latihan.',
    icon: <ForumIcon />,
  },
  {
    title: 'Manajemen Waktu',
    description: 'Optimalkan waktu tes dengan latihan simulasi yang realistis.',
    icon: <LocalLibraryIcon />,
  },
  {
    title: 'Sistem CAT',
    description: 'Bersiaplah untuk SKD CPNS dengan simulasi sistem CAT yang otentik.',
    icon: <LaptopIcon />,
  },
  {
    title: 'Akses Belajar Fleksibel',
    description: 'Belajar tanpa batas, akses materi di mana saja melalui aplikasi atau web.',
    icon: <TimelineIcon />,
  },
  {
    title: 'Soal Berstandar HOTS',
    description: 'Tingkatkan analisis dan pemecahan masalah dengan latihan soal HOTS.',
    icon: <QuizIcon />,
  },
]
