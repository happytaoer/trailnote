'use client';

import { useState } from 'react';
import { Modal, Form, Typography, Button, Space, message, Tooltip, Switch } from 'antd';
import { CopyOutlined, LinkOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Project } from '@/types';
import { useProjectStore } from '@/stores/useProjectStore';

interface ShareProjectModalProps {
  open: boolean;
  project: Project | null;
  onCancel: () => void;
  onProjectUpdate?: (updatedProject: Project) => void;
}

/**
 * Modal component for sharing project with others
 * @param open Whether the modal is open
 * @param project The project to share
 * @param onCancel Handler for canceling the share operation
 */
const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  open,
  project,
  onCancel,
  onProjectUpdate,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  
  // Use merged project store for sharing state management
  const { getSharingEnabled, setSharingEnabled } = useProjectStore();
  
  // Get sharing state from store
  const sharingEnabled = project ? getSharingEnabled(project.id) : false;

  const handleCopyLink = () => {
    if (!project) return;
    
    // Create and copy the direct share URL to clipboard
    const shareUrl = `${window.location.origin}/shared/${project.share_url}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => messageApi.success('Share link copied to clipboard'))
      .catch(() => messageApi.error('Failed to copy link'));
  };

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleSharingChange = async (checked: boolean) => {
    if (!project) return;

    setIsUpdating(true);
    
    try {
      // Use the merged store method which handles API call and state update
      await setSharingEnabled(project.id, checked);
      
      // Notify parent component of the update
      onProjectUpdate?.(project);
      
      // Success message confirms the change
      messageApi.success(`Project sharing ${checked ? 'enabled' : 'disabled'} successfully`);
    } catch (error: any) {
      messageApi.error(`Error updating sharing status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      title={<div style={{ display: 'flex', alignItems: 'center' }}>
        <ShareAltOutlined style={{ marginRight: 8 }} /> 
        Share Project
      </div>}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        {/* Sharing toggle */}
        <div style={{ marginBottom: 16 }}>
          <Space align="center">
            <Typography.Text strong>Enable Sharing:</Typography.Text>
            <Switch 
              checked={sharingEnabled} 
              onChange={handleSharingChange}
              loading={isUpdating}
            />
          </Space>
        </div>

        {/* Share URL display - always visible and functional */}
        {project?.share_url && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text strong>Share Link:</Typography.Text>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              background: '#f5f5f5',
              borderRadius: 4,
              marginTop: 8
            }}>
              <LinkOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Typography.Text ellipsis style={{ flex: 1 }}>
                {`${window.location.origin}/shared/${project.share_url}`}
              </Typography.Text>
              <Tooltip title="Copy link">
                <Button 
                  type="text" 
                  icon={<CopyOutlined />} 
                  onClick={handleCopyLink}
                  size="small"
                />
              </Tooltip>
            </div>
          </div>
        )}

        {/* Warning about sharing */}
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 16 }}>
          Anyone with the link will be able to access this project according to the permissions you set.
        </Typography.Paragraph>
      </Form>
    </Modal>
  );
};

export default ShareProjectModal;
