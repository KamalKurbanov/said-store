import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useExportTransactions,
} from '../api/api-hooks';
import type { Transaction } from '../api/api-client';

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value);

const SummaryCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({
  title, value, icon, color,
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, p: 1, borderRadius: 1 }}>{icon}</Box>
      </Box>
      <Typography color="text.secondary" variant="body2">{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{formatCurrency(value)}</Typography>
    </CardContent>
  </Card>
);

const typeLabels: Record<string, string> = { income: 'Доход', expense: 'Расход' };
const typeColors: Record<string, 'success' | 'error'> = { income: 'success', expense: 'error' };
const paymentLabels: Record<string, string> = { card: 'Карта', cash: 'Наличные', invoice: 'Счёт' };
const statusLabels: Record<string, string> = { confirmed: 'Подтверждено', pending: 'В обработке', cancelled: 'Отменено' };
const statusColors: Record<string, 'success' | 'warning' | 'error'> = { confirmed: 'success', pending: 'warning', cancelled: 'error' };

const emptyForm = {
  type: 'income' as const,
  category: '',
  amount: '',
  paymentMethod: 'card' as const,
  description: '',
  status: 'confirmed' as const,
};

const PnLReport: React.FC = () => {
  const { data: transactions = [], isLoading } = useTransactions();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const exportMutation = useExportTransactions();

  // Форма добавления
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  // Inline-редактирование
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Transaction, 'id' | 'date' | 'createdAt' | 'updatedAt'> | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Добавление ──
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    if (!form.category || !form.amount) {
      setError('Заполните категорию и сумму');
      return;
    }
    try {
      await createMutation.mutateAsync({
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        description: form.description || undefined,
        status: form.status,
      });
      setForm(emptyForm);
      setShowForm(false);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Inline-редактирование ──
  const startEditing = useCallback((row: Transaction) => {
    setEditingId(row.id);
    setEditForm({
      type: row.type,
      category: row.category,
      amount: row.amount,
      paymentMethod: row.paymentMethod,
      description: row.description || '',
      status: row.status,
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditForm(null);
  }, []);

  const saveEditing = useCallback(async () => {
    if (!editingId || !editForm) return;
    if (!editForm.category || !editForm.amount) {
      setError('Заполните категорию и сумму');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: {
          type: editForm.type,
          category: editForm.category,
          amount: Number(editForm.amount),
          paymentMethod: editForm.paymentMethod,
          description: editForm.description || undefined,
          status: editForm.status,
        },
      });
      setEditingId(null);
      setEditForm(null);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  }, [editingId, editForm, updateMutation]);

  const editChange = useCallback((field: string, value: any) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  // ── Удаление ──
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Подсчёт сводки
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    return { totalIncome, totalExpense, netProfit, margin };
  }, [transactions]);

  const columns = useMemo<MRT_ColumnDef<Transaction>[]>(() => [
    {
      accessorKey: 'type',
      header: 'Тип',
      size: 130,
      Cell: ({ cell, row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing && editForm) {
          return (
            <FormControl fullWidth size="small">
              <Select
                value={editForm.type}
                onChange={(e) => editChange('type', e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="income">Доход</MenuItem>
                <MenuItem value="expense">Расход</MenuItem>
              </Select>
            </FormControl>
          );
        }
        return (
          <Chip
            label={typeLabels[cell.getValue() as string] || cell.getValue()}
            color={typeColors[cell.getValue() as string] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Категория',
      size: 170,
      Cell: ({ cell, row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing && editForm) {
          return (
            <TextField
              size="small"
              value={editForm.category}
              onChange={(e) => editChange('category', e.target.value)}
              fullWidth
            />
          );
        }
        return <span>{cell.getValue() as string}</span>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Сумма',
      size: 140,
      Cell: ({ cell, row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing && editForm) {
          return (
            <TextField
              size="small"
              type="number"
              value={editForm.amount}
              onChange={(e) => editChange('amount', e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
            />
          );
        }
        return <b>{formatCurrency(cell.getValue() as number)}</b>;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Способ оплаты',
      size: 150,
      Cell: ({ cell, row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing && editForm) {
          return (
            <FormControl fullWidth size="small">
              <Select
                value={editForm.paymentMethod}
                onChange={(e) => editChange('paymentMethod', e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="card">Карта</MenuItem>
                <MenuItem value="cash">Наличные</MenuItem>
                <MenuItem value="invoice">Счёт</MenuItem>
              </Select>
            </FormControl>
          );
        }
        return <span>{paymentLabels[cell.getValue() as string] || cell.getValue()}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Описание',
      size: 220,
      Cell: ({ cell, row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing && editForm) {
          return (
            <TextField
              size="small"
              value={editForm.description}
              onChange={(e) => editChange('description', e.target.value)}
              fullWidth
            />
          );
        }
        return <span>{(cell.getValue() as string) || '—'}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      size: 150,
      Cell: ({ cell, row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing && editForm) {
          return (
            <FormControl fullWidth size="small">
              <Select
                value={editForm.status}
                onChange={(e) => editChange('status', e.target.value)}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="confirmed">Подтверждено</MenuItem>
                <MenuItem value="pending">В обработке</MenuItem>
                <MenuItem value="cancelled">Отменено</MenuItem>
              </Select>
            </FormControl>
          );
        }
        return (
          <Chip
            label={statusLabels[cell.getValue() as string] || cell.getValue()}
            color={statusColors[cell.getValue() as string] || 'default'}
            size="small"
          />
        );
      },
    },
  ], [editingId, editForm, editChange]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>P&L Доход и расход</Typography>
        <Typography variant="h6" color="text.secondary">
          Управляйте доходами и расходами
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><SummaryCard title="Доход" value={summary.totalIncome} icon={<TrendingUpIcon />} color="success" /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Расходы" value={summary.totalExpense} icon={<TrendingDownIcon />} color="error" /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Прибыль" value={summary.netProfit} icon={<MoneyIcon />} color={summary.netProfit >= 0 ? 'success' : 'error'} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Маржа" value={summary.margin} icon={<PercentIcon />} color="info" /></Grid>
      </Grid>

      {/* Add Transaction Form */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Добавить транзакцию</Typography>
          {!showForm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
              Добавить
            </Button>
          )}
        </Box>

        {showForm && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Тип</InputLabel>
                  <Select value={form.type} label="Тип" onChange={(e) => handleChange('type', e.target.value)}>
                    <MenuItem value="income">Доход</MenuItem>
                    <MenuItem value="expense">Расход</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" label="Категория" value={form.category} onChange={(e) => handleChange('category', e.target.value)} required />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" label="Сумма" type="number" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} required />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Способ оплаты</InputLabel>
                  <Select value={form.paymentMethod} label="Способ оплаты" onChange={(e) => handleChange('paymentMethod', e.target.value)}>
                    <MenuItem value="card">Карта</MenuItem>
                    <MenuItem value="cash">Наличные</MenuItem>
                    <MenuItem value="invoice">Счёт</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Статус</InputLabel>
                  <Select value={form.status} label="Статус" onChange={(e) => handleChange('status', e.target.value)}>
                    <MenuItem value="confirmed">Подтверждено</MenuItem>
                    <MenuItem value="pending">В обработке</MenuItem>
                    <MenuItem value="cancelled">Отменено</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth size="small" label="Описание" value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="error" onClick={() => { setForm(emptyForm); setShowForm(false); }}>
                Отмена
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={createMutation.isPending ? <CircularProgress size={16} /> : <AddIcon />}
                onClick={handleAdd}
                disabled={createMutation.isPending}
              >
                Сохранить
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Transactions Table */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Транзакции</Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={exportMutation.isPending ? <CircularProgress size={16} /> : <GetAppIcon />}
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending || transactions.length === 0}
          >
            Выгрузить в Excel
          </Button>
        </Box>

        <MaterialReactTable
          columns={columns}
          data={transactions}
          state={{ isLoading }}
          enableColumnFilters
          enableSorting
          enablePagination
          enableTopToolbar
          enableColumnActions
          enableDensityToggle
          enableHiding
          enableRowActions
          positionActionsColumn="last"
          muiTableBodyRowProps={{ hover: true }}
          renderRowActions={({ row }) => {
            const isEditing = editingId === row.original.id;
            if (isEditing) {
              return (
                <Box sx={{ display: 'flex', gap: 0.5, whiteSpace: 'nowrap' }}>
                  <Tooltip title="Сохранить">
                    <IconButton size="small" color="success" onClick={saveEditing} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <CircularProgress size={18} /> : <SaveIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Отмена">
                    <IconButton size="small" color="error" onClick={cancelEditing}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            }
            return (
              <Box sx={{ display: 'flex', gap: 0.5, whiteSpace: 'nowrap' }}>
                <Tooltip title="Редактировать">
                  <IconButton size="small" color="primary" onClick={() => startEditing(row.original)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton size="small" color="error" onClick={() => handleDelete(row.original.id)} disabled={deleteMutation.isPending}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          }}
        />
      </Paper>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success">Операция выполнена успешно!</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
};

export default PnLReport;
