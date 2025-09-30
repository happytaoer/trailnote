'use client';

import { useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types';

interface ProjectImageUrlProps {
  projectId: number;
  onSuccess: (project: Project | { cover_image_url: string }) => void;
  onClose: () => void;
  isNewProject?: boolean;
}

const ProjectImageUrl: React.FC<ProjectImageUrlProps> = ({
  projectId,
  onSuccess,
  onClose,
  isNewProject = false
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    if (!imageUrl.trim()) {
      message.error('Please enter a valid URL');
      return;
    }

    // Simple URL validation
    try {
      new URL(imageUrl);
    } catch (e) {
      message.error('Please enter a valid URL');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isNewProject) {
        // For new projects, just return the URL to the parent component
        // The parent will handle creating the project with this URL
        onSuccess({ cover_image_url: imageUrl });
        message.success('Image URL added');
      } else {
        // For existing projects, update the project with the new image URL
        const updatedProject = await projectsApi.updateProjectCoverImage(
          projectId,
          imageUrl,
          '' // No storage path for external URLs
        );
        
        message.success('Cover image added successfully');
        onSuccess(updatedProject);
      }
      
      onClose();
    } catch (error: any) {
      message.error(`Failed to add image: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item 
        label="Image URL" 
        name="imageUrl" 
        rules={[
          { required: true, message: 'Please enter an image URL' },
          { type: 'url', message: 'Please enter a valid URL' }
        ]}
      >
        <Input
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </Form.Item>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="primary" 
          htmlType="submit"
          loading={isSubmitting}
        >
          Add Image
        </Button>
      </div>
    </Form>
  );
};

export default ProjectImageUrl;
