'use client';

import { Button, Input, Modal, Typography, Form, Alert, Select, message, Dropdown, DatePicker } from 'antd';
import { UploadOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { FaTrash, FaSpinner, FaCaretDown } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { storageApi, projectsApi } from '@/lib/api';
import { useProjectStore } from '@/stores/useProjectStore';
import ProjectImageUrl from './ProjectImageUrl';
import { Dayjs } from 'dayjs';

interface CreateProjectModalProps {
  open: boolean;
  onCancel: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onCancel
}) => {
  const { user } = useAuth();
  const { totalProjects, createProject } = useProjectStore();
  const [projectName, setProjectName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('planning');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string>('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUrlImage, setIsUrlImage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageUrlModalVisible, setIsImageUrlModalVisible] = useState<boolean>(false);
  const [isRemovingImage, setIsRemovingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const hasActiveSubscription = user?.subscription?.subscriptionStatus === 'active';
  const projectLimitReached = !hasActiveSubscription && totalProjects >= 5;

  // Styles constants
  const hiddenInputStyle = {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: '0'
  };

  const resetForm = () => {
    setProjectName('');
    setDescription('');
    setStatus('planning');
    setStartDate(null);
    setEndDate(null);
    setError('');
    setCoverImage(null);
    setIsUrlImage(false);
    
    // Clean up any blob URLs
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  useEffect(() => {
    if (open) {
      setError('');
    } else {
      resetForm();
    }
    
    return () => {
      // Clean up preview URL when modal closes
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open, previewUrl]);

  const handleConfirm = async () => {
    if (!projectName.trim()) return;
    
    if (projectLimitReached) {
      setError('Free plan limited to 5 projects. Please upgrade to Premium for unlimited projects.');
      return;
    }
    
    const startDateString = startDate?.toISOString();
    const endDateString = endDate?.toISOString();
    
    setIsLoading(true);
    
    try {
      if (coverImage) {
        // File upload case
        const newProject = await createProject(projectName, description, status, undefined, undefined, startDateString, endDateString);
        const { publicUrl, storagePath } = await storageApi.uploadProjectImage(coverImage, newProject.id);
        await projectsApi.updateProjectCoverImage(newProject.id, publicUrl, storagePath);
      } else {
        // URL image or no image case
        const imageUrl = isUrlImage ? previewUrl : undefined;
        const storagePath = isUrlImage ? '' : undefined;
        await createProject(projectName, description, status, imageUrl, storagePath, startDateString, endDateString);
      }
      
      message.success('Project created successfully');
      handleCancel();
    } catch (error: any) {
      message.error(`Error creating project: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        message.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image size should be less than 5MB');
        return;
      }
      
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setCoverImage(file);
      setIsUrlImage(false); // Reset URL image flag when selecting a file
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageUrlSuccess = (project: { cover_image_url: string } | any) => {
    setIsImageUrlModalVisible(false);
    // Use the URL as our cover image
    setCoverImage(null);
    
    // Get the URL from either a Project object or our simple object with cover_image_url
    const imageUrl = project.cover_image_url || '';
    setPreviewUrl(imageUrl);
    setIsUrlImage(true); // Mark this as a URL-based image
  };
  
  const removeCoverImage = () => {
    setIsRemovingImage(true);
    setCoverImage(null);
    
    try {
      // Reset the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // If there was a blob URL preview, revoke it
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Always clear the preview URL to reset the UI
      setPreviewUrl('');
      setIsUrlImage(false);
      
      message.success('Image selection cleared');
    } catch (error: any) {
      message.error(`Failed to remove image: ${error.message}`);
    } finally {
      setIsRemovingImage(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      closable={true}
      maskClosable={false}
      className="responsive-modal"
      width="95%"
      style={{ maxWidth: '480px', padding: '12px 16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <Typography.Title level={4} style={{ margin: 0, fontSize: '1.2rem' }}>
          Create Project
        </Typography.Title>
      </div>
      
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          action={
            <Link href="/pricing">
              <Button size="small" type="primary">
                Upgrade
              </Button>
            </Link>
          }
          style={{ marginBottom: 12, padding: '4px 8px' }}
        />
      )}
      
      <Form layout="vertical" style={{ marginBottom: '1rem' }} size="small">
        <Form.Item 
          label={<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>Title <span style={{ color: '#ff4d4f' }}>*</span></span>
          </div>}
          help={<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography.Text type={projectName.length > 30 ? 'danger' : 'secondary'} style={{ fontSize: '0.7rem' }}>
              {projectName.length}/30
            </Typography.Text>
          </div>}
          validateStatus={projectName.length > 30 ? 'error' : ''}
          style={{ marginBottom: '8px' }}
        >
          <Input
            placeholder="Enter a title, e.g. 'Jiuzhaigou 3-Day Tour'"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value.slice(0, 30))}
            autoFocus
            size="middle"
            maxLength={30}
          />
        </Form.Item>
        
        <Form.Item 
          label={<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>Description</span>
          </div>}
          help={<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography.Text type={description.length > 150 ? 'danger' : 'secondary'} style={{ fontSize: '0.7rem' }}>
              {description.length}/150
            </Typography.Text>
          </div>}
          validateStatus={description.length > 150 ? 'error' : ''}
          style={{ marginBottom: '8px' }}
        >
          <Input.TextArea
            placeholder="Briefly describe your trip (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 150))}
            autoSize={{ minRows: 2, maxRows: 3 }}
            maxLength={150}
          />
        </Form.Item>
        
        <Form.Item 
          label={<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>Status <span style={{ color: '#ff4d4f' }}>*</span></span>
          </div>}
          style={{ marginBottom: '8px' }}
        >
          <Select
            value={status}
            onChange={(value) => setStatus(value)}
            options={[
              { value: 'planning', label: 'Planning' },
              { value: 'on_going', label: 'On Going' },
              { value: 'completed', label: 'Completed' }
            ]}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Form.Item 
            label={<span>Start Date</span>}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date)}
              placeholder="Select start date"
              style={{ width: '100%' }}
              disabledDate={(current) => {
                // Disable dates after end date if end date is selected
                return !!(endDate && current && current.isAfter(endDate, 'day'));
              }}
            />
          </Form.Item>

          <Form.Item 
            label={<span>End Date</span>}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <DatePicker
              value={endDate}
              onChange={(date) => setEndDate(date)}
              placeholder="Select end date"
              style={{ width: '100%' }}
              disabledDate={(current) => {
                // Disable dates before start date if start date is selected
                return !!(startDate && current && current.isBefore(startDate, 'day'));
              }}
            />
          </Form.Item>
        </div>

        <Form.Item
          label={<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>Cover Image</span>
          </div>}
          style={{ marginBottom: '4px' }}
        >
          <input
            type="file"
            accept="image/*"
            style={hiddenInputStyle}
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          
          {previewUrl ? (
            <div className="relative mt-2">
              <div className="w-full bg-gray-100 rounded-md overflow-hidden relative" style={{ height: 'min(10rem, 25vh)' }}>
                <Image
                  src={previewUrl}
                  alt="Cover preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className={`object-cover transition-opacity duration-200 ${isRemovingImage ? 'opacity-40' : 'opacity-100'}`}
                  unoptimized={isUrlImage} // If it's a URL image
                />
                {isRemovingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <FaSpinner className="animate-spin text-white drop-shadow-lg" size={20} />
                  </div>
                ) : (
                  <button 
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 hover:scale-110 z-10 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCoverImage();
                    }}
                    title="Remove image"
                    disabled={isRemovingImage}
                  >
                    <FaTrash size={9} className="text-red-500 hover:animate-bounce" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <Dropdown 
              menu={{
                items: [
                  {
                    key: 'upload',
                    label: 'Upload from device',
                    icon: <UploadOutlined />,
                    onClick: triggerFileInput
                  },
                  {
                    key: 'url',
                    label: 'Add image URL',
                    icon: <LinkOutlined />,
                    onClick: () => setIsImageUrlModalVisible(true)
                  }
                ]
              }}
              placement="bottomLeft"
              trigger={['click']}
            >
              <Button 
                icon={<PictureOutlined />}
                block
              >
                Add Cover Image <FaCaretDown className="ml-1" />
              </Button>
            </Dropdown>
          )}
          {isLoading && (
            <div className="mt-2 text-center text-blue-500">
              <span>Processing...</span>
            </div>
          )}
        </Form.Item>
      </Form>
      
      <div className="flex justify-between gap-2">
        <Button 
          size="middle"
          className="flex-1"
          onClick={handleCancel} 
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="primary" 
          size="middle"
          className="flex-1"
          onClick={handleConfirm}
          loading={isLoading}
        >
          Save
        </Button>
      </div>
      
      {/* Image URL Modal */}
      <Modal
        title="Add Cover Image URL"
        open={isImageUrlModalVisible}
        onCancel={() => setIsImageUrlModalVisible(false)}
        footer={null}
        destroyOnHidden
        width="95%"
        style={{ maxWidth: '480px', padding: '12px 16px' }}
        styles={{ body: { padding: '8px 0' } }}
      >
        <ProjectImageUrl
          projectId={0} // Temporary, will be set after project creation
          onSuccess={handleImageUrlSuccess}
          onClose={() => setIsImageUrlModalVisible(false)}
          isNewProject={true} // This is a new project
        />
      </Modal>
    </Modal>
  );
};

export default CreateProjectModal;
