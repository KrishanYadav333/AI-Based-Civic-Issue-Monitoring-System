import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, deleteUser } from '../../store/analyticsSlice';
import { Card, Button, Input, Select, Modal } from '../common/FormElements';
import { CardSkeleton } from '../common/Loaders';
import { Edit2, Trash2, Plus, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(state => state.users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'engineer',
    wardAssigned: [],
    phone: '',
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        wardAssigned: user.wardAssigned || [],
        phone: user.phone || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'engineer',
        wardAssigned: [],
        phone: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    dispatch(addUser(formData));
    setIsModalOpen(false);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  if (loading) {
    return <CardSkeleton count={5} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </motion.div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Ward(s)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    variants={itemVariants}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {user.wardAssigned ? user.wardAssigned.join(', ') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </motion.div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Add'} User
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+1 (555) 000-0000"
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            options={[
              { label: 'Engineer', value: 'engineer' },
              { label: 'Admin', value: 'admin' },
            ]}
          />
          {formData.role === 'engineer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign Wards
              </label>
              <div className="space-y-2">
                {['Ward 1', 'Ward 2', 'Ward 3'].map(ward => (
                  <label key={ward} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.wardAssigned.includes(ward)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            wardAssigned: [...formData.wardAssigned, ward],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            wardAssigned: formData.wardAssigned.filter(w => w !== ward),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{ward}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
