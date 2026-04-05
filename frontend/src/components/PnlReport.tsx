import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';

interface PnlData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    margin: number;
  };
  byCategory: {
    category: string;
    total: number;
    type: string;
  }[];
  monthly: {
    month: string;
    income: number;
    expense: number;
    profit: number;
  }[];
  raw: any[];
}

interface PnlReportProps {
  data: PnlData;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            bgcolor: `${color}.lighter`,
            color: `${color}.main`,
            p: 1,
            borderRadius: 1,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        {formatCurrency(value)}
      </Typography>
    </CardContent>
  </Card>
);

const PnlReport: React.FC<PnlReportProps> = ({ data }) => {
  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TableChartIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            P&L Отчёт
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Общий доход"
              value={data.summary.totalIncome}
              icon={<TrendingUpIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Общие расходы"
              value={data.summary.totalExpense}
              icon={<TrendingDownIcon />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Чистая прибыль"
              value={data.summary.netProfit}
              icon={<MoneyIcon />}
              color={data.summary.netProfit >= 0 ? 'success' : 'error'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Маржинальность"
              value={data.summary.margin}
              icon={<PercentIcon />}
              color="info"
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          По категориям
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Категория</TableCell>
                <TableCell align="right">Тип</TableCell>
                <TableCell align="right">Сумма</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.byCategory.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.category}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={row.type === 'income' ? 'Доход' : 'Расход'}
                      color={row.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          По месяцам
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Месяц</TableCell>
                <TableCell align="right">Доход</TableCell>
                <TableCell align="right">Расход</TableCell>
                <TableCell align="right">Прибыль</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.monthly.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {formatCurrency(row.income)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {formatCurrency(row.expense)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 'bold',
                      color: row.profit >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {formatCurrency(row.profit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PnlReport;
