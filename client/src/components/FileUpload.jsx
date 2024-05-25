import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    await onFileUpload(selectedFile);
    setIsUploading(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        border: '2px dashed #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        width: '100%',
        maxWidth: 400,
        margin: 'auto',
      }}
    >
      <CloudUploadIcon color="primary" sx={{ fontSize: 50, marginBottom: 2 }} />
      <Typography variant="h6" gutterBottom>
        Upload Your File
      </Typography>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label htmlFor="file-input">
        <Button variant="contained" component="span">
          Choose File
        </Button>
      </label>
      {selectedFile && (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          {selectedFile.name}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        sx={{ marginTop: 2 }}
      >
        {isUploading ? <CircularProgress size={24} /> : 'Upload'}
      </Button>
    </Box>
  );
};

export default FileUpload;
