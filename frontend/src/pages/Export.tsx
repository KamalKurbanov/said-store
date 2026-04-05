import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useUploadReport, useReports } from '../api/api-hooks';
import FileUpload from '../components/FileUpload';

const Export: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadMutation = useUploadReport();
  const { data: reports, isLoading: reportsLoading } = useReports();

  const handleFileUpload = async (file: File) => {
    setError(null);

    try {
      await uploadMutation.mutateAsync(file);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const reportsColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: 'filename', header: 'Файл' },
    {
      accessorKey: 'createdAt',
      header: 'Дата загрузки',
      Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString('ru-RU'),
    },
  ], []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Выгрузка данных</Typography>
        <Typography variant="h6" color="text.secondary">
          Загрузите файл и просмотрите историю выгрузок
        </Typography>
      </Box>

      {/* Upload */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CloudUploadIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5">Загрузка файла</Typography>
        </Box>
        <FileUpload onFileUpload={handleFileUpload} loading={uploadMutation.isPending} />
        {uploadMutation.isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress /><Typography sx={{ ml: 2 }}>Обработка...</Typography>
          </Box>
        )}
      </Paper>

      {/* Reports History */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>История выгрузок</Typography>
        <MaterialReactTable
          columns={reportsColumns}
          data={reports ?? []}
          state={{ isLoading: reportsLoading }}
          enableColumnFilters
          enableSorting
          enablePagination
          enableTopToolbar
          enableColumnActions
          enableDensityToggle
          enableHiding
          muiTableBodyRowProps={{ hover: true }}
        />
      </Paper>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success">Файл успешно загружен!</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Export;
