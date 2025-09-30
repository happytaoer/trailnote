'use client';

import { useState } from 'react';
import { Typography, Form, Button, message, Divider, Input, Modal } from 'antd';
import { LogoutOutlined, LoadingOutlined, KeyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Profile component displays user profile information.
 * Gets user data directly from auth store.
 */
const Profile: React.FC = () => {
  const { Title } = Typography;
  const [messageApi, contextHolder] = message.useMessage();
  const { user, logout, updatePassword } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm] = Form.useForm();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await logout();
      if (error) {
        messageApi.error(`Logout error: ${error.message}`);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      messageApi.error(`Logout error: ${error.message}`);
      setIsLoggingOut(false);
    }
  };

  const handlePasswordChange = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    setIsUpdatingPassword(true);
    try {
      // Note: Current implementation doesn't verify old password
      // In a production app, you'd want to verify the old password first
      const { error } = await updatePassword(values.newPassword);
      if (error) {
        messageApi.error(`Password update error: ${error.message}`);
      } else {
        messageApi.success('Password updated successfully');
        setIsPasswordModalOpen(false);
        passwordForm.resetFields();
      }
    } catch (error: any) {
      messageApi.error(`Password update error: ${error.message}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordModalCancel = () => {
    setIsPasswordModalOpen(false);
    passwordForm.resetFields();
  };

  return (
    <>
      {contextHolder}
      <div className="profile-settings">
        <Title level={5}>Profile Information</Title>
        
        {/* Email Information */}
        <div className="flex items-start justify-between py-4 border-b border-gray-100">
          <div className="flex-1 pr-8">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Email Address
            </div>
            <div className="text-sm text-gray-500">
              Your registered email address for account access and notifications
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="text-sm text-gray-900 font-medium">
              {user?.email || 'Not available'}
            </div>
          </div>
        </div>
        
        {/* Change Password */}
        <div className="flex items-start justify-between py-4 border-b border-gray-100">
          <div className="flex-1 pr-8">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Password
            </div>
            <div className="text-sm text-gray-500">
              Update your account password to keep your account secure
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              type="default"
              icon={<KeyOutlined />}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change Password
            </Button>
          </div>
        </div>
        
        {/* Logout */}
        <div className="flex items-start justify-between py-4">
          <div className="flex-1 pr-8">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Sign Out
            </div>
            <div className="text-sm text-gray-500">
              Sign out of your account and return to the login page
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              type="primary"
              danger
              icon={isLoggingOut ? <LoadingOutlined spin /> : <LogoutOutlined />}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={isPasswordModalOpen}
        onCancel={handlePasswordModalCancel}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          autoComplete="off"
        >
          <Form.Item
            name="oldPassword"
            label="Current Password"
            rules={[
              { required: true, message: 'Please enter your current password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter current password" autoComplete="new-password" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter new password" autoComplete="new-password" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" autoComplete="new-password" />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={handlePasswordModalCancel}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isUpdatingPassword}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Profile;
