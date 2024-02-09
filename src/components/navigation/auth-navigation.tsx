"use client"

import React, { FC, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { StyledButton } from '@/components/styled-button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const AuthNavigation: FC = () => {
  const router = useRouter()
  const { data: session, status  } = useSession(); 
  // console.log(session)

  const [showButtons, setShowButtons] = useState(false); // State to control visibility of buttons

  useEffect(() => {
    if (status !== 'loading') {
      // When the session status is not 'loading', show the buttons
      setShowButtons(true);
    }
  }, [status]);

  if (!showButtons) {
    // Render nothing if buttons should not be shown
    return null;
  }

  return (
    <Box sx={{ '& button:first-child': { mr: 2, fontWeight: 600 } }}>
      {session ? (
        // If the user is logged in, show Dashboard button
        <StyledButton onClick={() => router.push("/dashboard")} disableHoverEffect={true}>
          Dashboard
        </StyledButton>
      ) : (
        // If the user is not logged in, show Sign In and Sign Up buttons
        <>
          <StyledButton onClick={() => router.push("/auth/sign-in")} disableHoverEffect={true} variant="outlined">
            Sign In
          </StyledButton>
          <StyledButton onClick={() => router.push("/auth/sign-up")} disableHoverEffect={true}>
            Sign Up
          </StyledButton>
        </>
      )}
    </Box>
  )
}

export default AuthNavigation
