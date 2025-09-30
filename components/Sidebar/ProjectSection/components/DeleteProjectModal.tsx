'use client';

import { Button, Modal, Typography, Alert, message } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Project } from '@/types';

interface DeleteProjectModalProps {
  open: boolean;
  project: Project | null;
  onCancel: () => void;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  open,
  project,
  onCancel
}) => {
  const { deleteProject } = useProjectStore();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleConfirm = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      message.success('Project deleted successfully');
      onCancel(); // Close modal after successful deletion
    } catch (error: any) {
      message.error(`Error deleting project: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={true}
      maskClosable={false}
      width={480}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Confirm Deletion
          </Typography.Title>
        </div>
        
        <Typography.Paragraph style={{ marginBottom: 12 }}>
          Are you sure you want to delete <Typography.Text strong>{project?.project_name || 'this project'}</Typography.Text>?
        </Typography.Paragraph>
        
        <Alert
          message="This action cannot be undone. Related markers and routes will also be deleted."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24, textAlign: 'left' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            size="large"
            style={{ width: '48%' }}
            onClick={onCancel} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            danger 
            type="primary" 
            size="large"
            style={{ width: '48%' }}
            onClick={handleConfirm}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;
