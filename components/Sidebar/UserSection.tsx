'use client';

import { useState } from 'react';
import { message, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Feedback from '@/components/Sidebar/Feedback';
import { SettingOutlined, MessageOutlined } from '@ant-design/icons';

const UserSection: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const router = useRouter();

  const isUserPresent: boolean = Boolean(user);

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', gap: 0, padding: '0 0' }}>
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => router.push('/settings')}
          style={{ flex: 1 }}
          disabled={!isUserPresent}
        >
          Settings
        </Button>
        <Button
          type="text"
          icon={<MessageOutlined />}
          onClick={() => setIsFeedbackModalOpen(true)}
          style={{ flex: 1 }}
          disabled={!isUserPresent}
        >
          Feedback
        </Button>
      </div>

      {isUserPresent && (
        <Feedback
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}
    </>
  );
};

export default UserSection;
