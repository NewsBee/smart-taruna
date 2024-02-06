import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  handleClose: (confirm: boolean) => void;
  title: string;
  description: string;
}

export const ConfirmationDialog = ({ open, handleClose, title, description }: ConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>Tidak</Button>
        <Button onClick={() => handleClose(true)} autoFocus>
          Ya
        </Button>
      </DialogActions>
    </Dialog>
  );
};
