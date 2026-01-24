import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, deleteUser } from '../../store/analyticsSlice';
import { Card, Button, Input, Select, Modal } from '../common/FormElements';
import { CardSkeleton } from '../common/Loaders';
import { Edit2, Trash2, Plus, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import backgroundImage from '../../assets/images/Background_image.jpg';

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
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navy blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-blue-800/30 to-blue-600/35 pointer-events-none"></div>
      
      <div className="relative z-10 p-8 space-y-6">
      {/* Header */}
      <motion.div 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold metallic-text">User Management</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add User
        </motion.button>
      </motion.div>

      {/* Users Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
        className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
      >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Ward(s)</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-white/90">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)', transition: { duration: 0.2 } }}
                    className="border-b border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white/80">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm ${
                        user.role === 'admin'
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30'
                          : 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/80">
                      {user.wardAssigned ? user.wardAssigned.join(', ') : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal(user)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-500/30 rounded-lg transition-all duration-300 text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

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
    </div>
  );
};

export default UserManagement;
