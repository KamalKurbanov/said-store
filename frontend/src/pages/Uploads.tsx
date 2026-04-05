import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Button,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useUploadReport, useReports, useDeleteTransaction } from '../api/api-hooks';
import FileUpload from '../components/FileUpload';
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

const PIE_COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

const Uploads: React.FC = () => {
  const [pnlData, setPnlData] = useState<{
    transactions: Transaction[];
    summary: { totalIncome: number; totalExpense: number; netProfit: number; margin: number };
    byCategory: { category: string; type: string; total: number }[];
    monthly: { month: string; income: number; expense: number; profit: number }[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadMutation = useUploadReport();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const deleteMutation = useDeleteTransaction();

  const handleFileUpload = async (file: File) => {
    setError(null);
    setPnlData(null);

    try {
      const result = await uploadMutation.mutateAsync(file);
      if (result.pnl && result.pnl.raw) {
        const raw: Transaction[] = result.pnl.raw.map((t: any, i: number) => ({
          id: `raw-${i}`,
          date: t.date || new Date().toISOString(),
          type: t.type,
          category: t.category,
          amount: t.amount,
          paymentMethod: 'card',
          description: t.description || '',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const totalIncome = raw.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = raw.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const netProfit = totalIncome - totalExpense;
        const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Группировка по категориям
        const catMap = new Map<string, { total: number; type: string }>();
        raw.forEach((t) => {
          const ex = catMap.get(t.category);
          if (ex) ex.total += t.amount;
          else catMap.set(t.category, { total: t.amount, type: t.type });
        });
        const byCategory = Array.from(catMap.entries()).map(([category, { total, type }]) => ({
          category, type, total: Math.round(total * 100) / 100,
        })).sort((a, b) => b.total - a.total);

        // Группировка по месяцам
        const monthMap = new Map<string, { income: number; expense: number }>();
        raw.forEach((t) => {
          let month = 'Не указано';
          if (t.date) {
            const m = String(t.date).match(/(\d{4})[-/](\d{1,2})/);
            if (m) month = `${m[1]}-${m[2].padStart(2, '0')}`;
          }
          const ex = monthMap.get(month);
          if (!ex) monthMap.set(month, { income: 0, expense: 0 });
          if (t.type === 'income') monthMap.get(month)!.income += t.amount;
          else monthMap.get(month)!.expense += t.amount;
        });
        const monthly = Array.from(monthMap.entries())
          .map(([month, { income, expense }]) => ({
            month,
            income: Math.round(income * 100) / 100,
            expense: Math.round(expense * 100) / 100,
            profit: Math.round((income - expense) * 100) / 100,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setPnlData({ transactions: raw, summary: { totalIncome, totalExpense, netProfit, margin }, byCategory, monthly });
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Таблица транзакций из загруженного файла
  const transactionColumns = useMemo<MRT_ColumnDef<Transaction>[]>(() => [
    {
      accessorKey: 'date',
      header: 'Дата',
      size: 120,
      Cell: ({ cell }) => <span>{cell.getValue() ? new Date(cell.getValue() as string).toLocaleDateString('ru-RU') : '—'}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      size: 110,
      Cell: ({ cell }) => (
        <Chip label={typeLabels[cell.getValue() as string] || cell.getValue()} color={typeColors[cell.getValue() as string] || 'default'} size="small" />
      ),
    },
    { accessorKey: 'category', header: 'Категория', size: 170 },
    {
      accessorKey: 'amount',
      header: 'Сумма',
      size: 130,
      Cell: ({ cell }) => <b>{formatCurrency(cell.getValue() as number)}</b>,
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Способ оплаты',
      size: 140,
      Cell: ({ cell }) => <span>{paymentLabels[cell.getValue() as string] || cell.getValue()}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Описание',
      size: 220,
      Cell: ({ cell }) => <span>{(cell.getValue() as string) || '—'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      size: 140,
      Cell: ({ cell }) => (
        <Chip label={statusLabels[cell.getValue() as string] || cell.getValue()} color={statusColors[cell.getValue() as string] || 'default'} size="small" />
      ),
    },
  ], []);

  const reportsColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: 'filename', header: 'Файл' },
    {
      accessorKey: 'createdAt',
      header: 'Дата загрузки',
      Cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleString('ru-RU'),
    },
  ], []);

  return (
    <Container maxWidth="xl" sx={{ pb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Загрузки</Typography>
        <Typography variant="h6" color="text.secondary">
          Загрузите Excel/CSV файл для формирования P&L отчёта
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

      {/* P&L Report from uploaded file */}
      {pnlData && (
        <>
          {/* Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}><SummaryCard title="Доход" value={pnlData.summary.totalIncome} icon={<TrendingUpIcon />} color="success" /></Grid>
            <Grid item xs={6} md={3}><SummaryCard title="Расходы" value={pnlData.summary.totalExpense} icon={<TrendingDownIcon />} color="error" /></Grid>
            <Grid item xs={6} md={3}><SummaryCard title="Прибыль" value={pnlData.summary.netProfit} icon={<MoneyIcon />} color={pnlData.summary.netProfit >= 0 ? 'success' : 'error'} /></Grid>
            <Grid item xs={6} md={3}><SummaryCard title="Маржа" value={pnlData.summary.margin} icon={<PercentIcon />} color="info" /></Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Monthly Income/Expense Bar */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Доходы и расходы по месяцам</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pnlData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="income" name="Доход" fill="#4caf50" />
                    <Bar dataKey="expense" name="Расход" fill="#f44336" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Monthly Profit Line */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Прибыль по месяцам</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pnlData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="profit" name="Прибыль" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Category Pie */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Расходы по категориям</Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pnlData.byCategory.filter((c) => c.type === 'expense')}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ category, total }) => `${category}: ${formatCurrency(total)}`}
                    >
                      {pnlData.byCategory.filter((c) => c.type === 'expense').map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Transactions Table */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Транзакции из файла</Typography>
            <MaterialReactTable
              columns={transactionColumns}
              data={pnlData.transactions}
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
        </>
      )}

      {/* Reports History */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>История загрузок</Typography>
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
          renderRowActions={({ row }) => (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteReport(row.original.id)}
              disabled={deleteMutation.isPending}
            >
              Удалить
            </Button>
          )}
        />
      </Paper>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success">Файл обработан! P&L отчёт сформирован.</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      </Container>
  );
};

export default Uploads;
