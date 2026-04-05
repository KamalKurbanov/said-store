import React, { useCallback } from 'react';
import {
  Button,
  Typography,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, loading }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: dragActive ? 'action.hover' : 'background.paper',
        border: 2,
        borderColor: dragActive ? 'primary.main' : 'divider',
        borderStyle: 'dashed',
        borderRadius: 2,
        transition: 'all 0.2s',
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <FileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />

      <Typography variant="h6" gutterBottom>
        Перетащите файл сюда или нажмите для выбора
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Поддерживаемые форматы: CSV, Excel (.xlsx, .xls)
      </Typography>

      {selectedFile && (
        <Typography variant="body2" sx={{ mb: 2, color: 'primary.main' }}>
          Выбранный файл: {selectedFile.name}
        </Typography>
      )}

      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={onButtonClick}
        disabled={loading}
        size="large"
      >
        Выбрать файл
      </Button>
    </Paper>
  );
};

export default FileUpload;
