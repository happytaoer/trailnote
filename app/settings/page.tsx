'use client';

import { useState, useEffect } from 'react';
import { Tabs, Space, message, Button } from 'antd';
import { SettingOutlined, UserOutlined, CrownOutlined, GlobalOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Import components from the new location
import Profile from '@/components/UserSettings/Profile';
import Subscriptions from '@/components/UserSettings/Subscriptions';
import MapSettings from '@/components/UserSettings/MapSettings';

/**
 * Settings page component for user settings including AI prompts and profile management
 */
const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null; // Will redirect to home
  }

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> Profile
        </span>
      ),
      children: (
        <Profile />
      ),
    },
    {
      key: 'map',
      label: (
        <span>
          <GlobalOutlined /> Map Settings
        </span>
      ),
      children: (
        <MapSettings 
          isLoading={isLoading}
        />
      ),
    },
    {
      key: 'subscriptions',
      label: (
        <span>
          <CrownOutlined /> Subscriptions
        </span>
      ),
      children: (
        <Subscriptions/>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {contextHolder}
      <div className="h-full">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <Space>
              <SettingOutlined className="text-xl" />
              <h1 className="text-2xl font-bold m-0">Settings</h1>
            </Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/map')}
              className="flex items-center"
            >
              Back to Map
            </Button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar Menu */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => setActiveTab(key)}
              tabPosition="left"
              items={items.map(item => ({
                ...item,
                children: null // Remove children from sidebar items
              }))}
              size="large"
              className="h-full"
            />
          </div>
          
          {/* Right Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {items.find(item => item.key === activeTab)?.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
