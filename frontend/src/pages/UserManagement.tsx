import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Shield as ShieldIcon,
  Edit as EditIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  useUsers,
  useUpdateUserRole,
  useDeleteUser,
  useRestaurants,
  useCreateRestaurant,
  useUpdateRestaurant,
  useDeleteRestaurant,
} from '../api/api-hooks';
import type { UserListItem, Restaurant } from '../api/contracts/api-contracts';
import styles from './UserManagement.module.css';

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  USER: 'User',
};

const roleColors: Record<string, 'success' | 'warning' | 'default'> = {
  ADMIN: 'success',
  MODERATOR: 'warning',
  USER: 'default',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`management-tabpanel-${index}`}
      aria-labelledby={`management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  // Users
  const { data: users = [], isLoading: usersLoading, refetch: usersRefetch, error: usersError } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  // Restaurants
  const { data: restaurants = [], isLoading: restaurantsLoading, refetch: restaurantsRefetch, error: restaurantsError } = useRestaurants();
  const createRestaurantMutation = useCreateRestaurant();
  const updateRestaurantMutation = useUpdateRestaurant();
  const deleteRestaurantMutation = useDeleteRestaurant();

  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [editRole, setEditRole] = useState<string>('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Restaurant dialogs
  const [openCreateRestaurant, setOpenCreateRestaurant] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [deleteRestaurantId, setDeleteRestaurantId] = useState<string | null>(null);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    imageUrl: '',
    isActive: true,
    ownerId: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRestaurantFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRestaurantForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateRestaurantDialog = () => {
    setRestaurantForm({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      imageUrl: '',
      isActive: true,
      ownerId: '',
    });
    setOpenCreateRestaurant(true);
  };

  const openEditRestaurantDialog = (restaurant: Restaurant) => {
    setEditRestaurant(restaurant);
    setRestaurantForm({
      name: restaurant.name || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      description: restaurant.description || '',
      imageUrl: restaurant.imageUrl || '',
      isActive: restaurant.isActive,
      ownerId: restaurant.ownerId || '',
    });
  };

  // ─────────────────────────────────────────────────────────────
  // User handlers
  // ─────────────────────────────────────────────────────────────

  const openEditUserDialog = useCallback((user: UserListItem) => {
    if (user.role === 'ADMIN') return;
    setEditUser(user);
    setEditRole(user.role);
  }, []);

  const closeEditUserDialog = useCallback(() => {
    setEditUser(null);
    setEditRole('');
  }, []);

  const saveUserRole = useCallback(async () => {
    if (!editUser || !editRole) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: editUser.id,
        role: editRole as 'ADMIN' | 'MODERATOR' | 'USER',
      });
      closeEditUserDialog();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  }, [editUser, editRole, updateRoleMutation, closeEditUserDialog]);

  const handleDeleteUser = useCallback(async () => {
    if (!deleteUserId) return;
    try {
      await deleteMutation.mutateAsync(deleteUserId);
      setDeleteUserId(null);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  }, [deleteUserId, deleteMutation]);

  const handleUsersRefresh = useCallback(() => {
    usersRefetch();
  }, [usersRefetch]);

  // ─────────────────────────────────────────────────────────────
  // Restaurant handlers
  // ─────────────────────────────────────────────────────────────

  const handleCreateRestaurant = async () => {
    try {
      await createRestaurantMutation.mutateAsync({
        name: restaurantForm.name,
        address: restaurantForm.address || undefined,
        phone: restaurantForm.phone || undefined,
        email: restaurantForm.email || undefined,
        description: restaurantForm.description || undefined,
        imageUrl: restaurantForm.imageUrl || undefined,
        isActive: restaurantForm.isActive,
        ownerId: restaurantForm.ownerId || undefined,
      });
      setOpenCreateRestaurant(false);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create restaurant');
    }
  };

  const handleUpdateRestaurant = async () => {
    if (!editRestaurant) return;
    try {
      await updateRestaurantMutation.mutateAsync({
        id: editRestaurant.id,
        data: {
          name: restaurantForm.name,
          address: restaurantForm.address || undefined,
          phone: restaurantForm.phone || undefined,
          email: restaurantForm.email || undefined,
          description: restaurantForm.description || undefined,
          imageUrl: restaurantForm.imageUrl || undefined,
          isActive: restaurantForm.isActive,
          ownerId: restaurantForm.ownerId || undefined,
        },
      });
      setEditRestaurant(null);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update restaurant');
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!deleteRestaurantId) return;
    try {
      await deleteRestaurantMutation.mutateAsync(deleteRestaurantId);
      if (selectedRestaurantId === deleteRestaurantId) {
        setSelectedRestaurantId('');
      }
      setDeleteRestaurantId(null);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to delete restaurant');
    }
  };

  const handleRestaurantsRefresh = () => {
    restaurantsRefetch();
  };

  // ─────────────────────────────────────────────────────────────
  // User columns
  // ─────────────────────────────────────────────────────────────

  const userColumns = useMemo<MRT_ColumnDef<UserListItem>[]>(() => [
    {
      accessorKey: 'email',
      header: 'Email',
      size: 250,
      Cell: ({ cell }) => <span className={styles.cellText}>{cell.getValue() as string}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 180,
      Cell: ({ cell }) => (
        <span className={styles.cellText}>{(cell.getValue() as string) || '—'}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      size: 160,
      Cell: ({ cell, row }) => (
        <Chip
          label={roleLabels[cell.getValue() as string] || (cell.getValue() as string)}
          color={roleColors[cell.getValue() as string] || 'default'}
          size="small"
          sx={{
            cursor: row.original.role === 'ADMIN' ? 'not-allowed' : 'pointer',
            opacity: row.original.role === 'ADMIN' ? 0.6 : 1,
          }}
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      size: 180,
      Cell: ({ cell }) => (
        <span className={styles.cellText}>
          {new Date(cell.getValue() as string).toLocaleDateString('ru-RU')}
        </span>
      ),
    },
  ], []);

  // ─────────────────────────────────────────────────────────────
  // Restaurant columns
  // ─────────────────────────────────────────────────────────────

  const restaurantColumns = useMemo<MRT_ColumnDef<Restaurant>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Название',
      size: 200,
      Cell: ({ cell }) => <span className={styles.cellText}>{cell.getValue() as string}</span>,
    },
    {
      accessorKey: 'address',
      header: 'Адрес',
      size: 200,
      Cell: ({ cell }) => (
        <span className={styles.cellText}>{(cell.getValue() as string) || '—'}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Телефон',
      size: 150,
      Cell: ({ cell }) => (
        <span className={styles.cellText}>{(cell.getValue() as string) || '—'}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 200,
      Cell: ({ cell }) => (
        <span className={styles.cellText}>{(cell.getValue() as string) || '—'}</span>
      ),
    },
    {
      accessorKey: 'owner.email',
      header: 'Владелец',
      size: 180,
      Cell: ({ row }) => (
        <span className={styles.cellText}>{row.original.owner?.email || '—'}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Статус',
      size: 120,
      Cell: ({ cell }) => (
        <span
          className={styles.cellText}
          style={{ color: cell.getValue() ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}
        >
          {cell.getValue() ? 'Активен' : 'Неактивен'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Создан',
      size: 150,
      Cell: ({ cell }) => (
        <span className={styles.cellText}>
          {new Date(cell.getValue() as string).toLocaleDateString('ru-RU')}
        </span>
      ),
    },
  ], []);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.pageContainer}>
      {(usersError || restaurantsError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {usersError && 'Ошибка загрузки пользователей. '}
          {restaurantsError && 'Ошибка загрузки ресторанов. '}
          Убедитесь, что вы вошли как Admin.
        </Alert>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <ShieldIcon className={styles.pageIcon} />
          <div>
            <Typography className={styles.pageTitle}>Управление</Typography>
            <Typography className={styles.pageSubtitle}>
              Управление пользователями и ресторанами
            </Typography>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="management tabs">
          <Tab label="Пользователи" />
          <Tab label="Рестораны" />
        </Tabs>
      </Box>

      {/* Restaurant selector (shown on all tabs) */}
      {restaurants.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <RestaurantIcon sx={{ color: '#4b4b4b' }} />
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Выбрать ресторан</InputLabel>
            <Select
              value={selectedRestaurantId}
              label="Выбрать ресторан"
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              sx={{ borderRadius: 8 }}
            >
              <MenuItem value="">Все рестораны</MenuItem>
              {restaurants.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedRestaurantId && (
            <Typography sx={{ color: '#4b4b4b', fontSize: '0.875rem' }}>
              (выбран)
            </Typography>
          )}
        </Box>
      )}

      {/* Users Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={usersLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleUsersRefresh}
            disabled={usersLoading}
          >
            Обновить
          </Button>
        </Box>

        <div className={styles.tableSection}>
          <MaterialReactTable
            columns={userColumns}
            data={users}
            state={{ isLoading: usersLoading }}
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
            renderRowActions={({ row }) => (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={row.original.role === 'ADMIN' ? 'Cannot edit admin' : 'Edit Role'}>
                  <IconButton
                    size="small"
                    onClick={() => openEditUserDialog(row.original)}
                    disabled={row.original.role === 'ADMIN'}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {row.original.role !== 'ADMIN' && (
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteUserId(row.original.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          />
        </div>
      </TabPanel>

      {/* Restaurants Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={restaurantsLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRestaurantsRefresh}
            disabled={restaurantsLoading}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateRestaurantDialog}
            disabled={createRestaurantMutation.isPending}
          >
            Создать ресторан
          </Button>
        </Box>

        <div className={styles.tableSection}>
          <MaterialReactTable
            columns={restaurantColumns}
            data={restaurants}
            state={{ isLoading: restaurantsLoading }}
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
            renderRowActions={({ row }) => (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Редактировать">
                  <IconButton
                    size="small"
                    onClick={() => openEditRestaurantDialog(row.original)}
                    disabled={updateRestaurantMutation.isPending}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteRestaurantId(row.original.id)}
                    disabled={deleteRestaurantMutation.isPending}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          />
        </div>
      </TabPanel>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* User Dialogs */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* Edit User Role Dialog */}
      <Dialog open={!!editUser} onClose={closeEditUserDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          {editUser && (
            <>
              <Typography sx={{ mb: 2, color: '#4b4b4b' }}>
                User: <b>{editUser.email}</b>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editRole}
                  label="Role"
                  onChange={(e) => setEditRole(e.target.value)}
                  sx={{ borderRadius: 8 }}
                >
                  <MenuItem value="MODERATOR">Moderator</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditUserDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveUserRole}
            disabled={updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteUserId} onClose={() => setDeleteUserId(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={18} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Restaurant Dialogs */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* Create Restaurant Dialog */}
      <Dialog
        open={openCreateRestaurant}
        onClose={() => setOpenCreateRestaurant(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Создать ресторан</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Название"
              name="name"
              value={restaurantForm.name}
              onChange={handleRestaurantFormChange}
              required
              fullWidth
            />
            <TextField
              label="Адрес"
              name="address"
              value={restaurantForm.address}
              onChange={handleRestaurantFormChange}
              fullWidth
            />
            <TextField
              label="Телефон"
              name="phone"
              value={restaurantForm.phone}
              onChange={handleRestaurantFormChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={restaurantForm.email}
              onChange={handleRestaurantFormChange}
              fullWidth
            />
            <TextField
              label="Описание"
              name="description"
              value={restaurantForm.description}
              onChange={handleRestaurantFormChange}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="URL изображения"
              name="imageUrl"
              value={restaurantForm.imageUrl}
              onChange={handleRestaurantFormChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Владелец</InputLabel>
              <Select
                name="ownerId"
                value={restaurantForm.ownerId}
                label="Владелец"
                onChange={handleRestaurantFormChange}
                sx={{ borderRadius: 8 }}
              >
                <MenuItem value="">— Не выбран —</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                name="isActive"
                value={restaurantForm.isActive ? 'true' : 'false'}
                label="Статус"
                onChange={(e) =>
                  setRestaurantForm((prev) => ({
                    ...prev,
                    isActive: e.target.value === 'true',
                  }))
                }
                sx={{ borderRadius: 8 }}
              >
                <MenuItem value="true">Активен</MenuItem>
                <MenuItem value="false">Неактивен</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateRestaurant(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleCreateRestaurant}
            disabled={createRestaurantMutation.isPending || !restaurantForm.name}
          >
            {createRestaurantMutation.isPending ? <CircularProgress size={18} /> : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Restaurant Dialog */}
      <Dialog
        open={!!editRestaurant}
        onClose={() => setEditRestaurant(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редактировать ресторан</DialogTitle>
        <DialogContent>
          {editRestaurant && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Название"
                name="name"
                value={restaurantForm.name}
                onChange={handleRestaurantFormChange}
                required
                fullWidth
              />
              <TextField
                label="Адрес"
                name="address"
                value={restaurantForm.address}
                onChange={handleRestaurantFormChange}
                fullWidth
              />
              <TextField
                label="Телефон"
                name="phone"
                value={restaurantForm.phone}
                onChange={handleRestaurantFormChange}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={restaurantForm.email}
                onChange={handleRestaurantFormChange}
                fullWidth
              />
              <TextField
                label="Описание"
                name="description"
                value={restaurantForm.description}
                onChange={handleRestaurantFormChange}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="URL изображения"
                name="imageUrl"
                value={restaurantForm.imageUrl}
                onChange={handleRestaurantFormChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Владелец</InputLabel>
                <Select
                  name="ownerId"
                  value={restaurantForm.ownerId}
                  label="Владелец"
                  onChange={handleRestaurantFormChange}
                  sx={{ borderRadius: 8 }}
                >
                  <MenuItem value="">— Не выбран —</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  name="isActive"
                  value={restaurantForm.isActive ? 'true' : 'false'}
                  label="Статус"
                  onChange={(e) =>
                    setRestaurantForm((prev) => ({
                      ...prev,
                      isActive: e.target.value === 'true',
                    }))
                  }
                  sx={{ borderRadius: 8 }}
                >
                  <MenuItem value="true">Активен</MenuItem>
                  <MenuItem value="false">Неактивен</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRestaurant(null)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleUpdateRestaurant}
            disabled={updateRestaurantMutation.isPending || !restaurantForm.name}
          >
            {updateRestaurantMutation.isPending ? <CircularProgress size={18} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Restaurant Confirmation Dialog */}
      <Dialog open={!!deleteRestaurantId} onClose={() => setDeleteRestaurantId(null)}>
        <DialogTitle>Удалить ресторан</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот ресторан? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRestaurantId(null)}>Отмена</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRestaurant}
            disabled={deleteRestaurantMutation.isPending}
          >
            {deleteRestaurantMutation.isPending ? <CircularProgress size={18} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Notifications */}
      {/* ───────────────────────────────────────────────────────────── */}

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success">Операция выполнена успешно!</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </div>
  );
};

export default UserManagement;
