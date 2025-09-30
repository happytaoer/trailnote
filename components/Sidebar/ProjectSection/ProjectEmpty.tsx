'use client';

import { Card, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

const { Title } = Typography;

interface ProjectEmptyProps {
  onClick: () => void;
}

/**
 * Empty state component displayed when no project is selected
 * @param onClick Callback function when the card is clicked
 */
const ProjectEmpty: React.FC<ProjectEmptyProps> = ({ onClick }): React.ReactNode => {
  // Default project data
  const defaultProjectName = 'No Projects Yet';
  const defaultDescription = 'Start tracking your adventures by creating your first project';
  
  // Card styles
  const styles = {
    card: {
      marginBottom: 16,
      cursor: 'pointer',
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      background: 'linear-gradient(135deg, #f0f8ff, #ffffff)',
      border: '1px dashed #1890ff80',
      position: 'relative' as const,
      transition: 'all 0.3s ease'
    },
    flexRow: {
      display: 'flex',
      alignItems: 'center',
    },
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      padding: '16px 0'
    },
    iconContainer: {
      marginBottom: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: '#e6f7ff',
      color: '#1890ff'
    },
    title: {
      margin: '8px 0',
      color: '#1890ff',
      fontWeight: 500
    },
    projectDescription: {
      fontSize: '13px',
      marginTop: 4,
      marginBottom: 16,
      color: 'rgba(0, 0, 0, 0.65)',
      maxWidth: '220px'
    },
    buttonContainer: {
      marginTop: 4
    }
  };
  
  return (
    <Card
      style={styles.card}
      styles={{ body: { padding: '16px' } }}
      onClick={onClick}
      hoverable
      className="project-card project-card-empty"
    >
      <div style={styles.container}>
        {/* Text content */}
        <Title level={5} style={styles.title}>
          {defaultProjectName}
        </Title>
        <Typography.Paragraph style={styles.projectDescription}>
          {defaultDescription}
        </Typography.Paragraph>
        
        {/* Call to action button */}
        <div style={styles.buttonContainer}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Prevent double triggering with card click
              onClick();
            }}
          >
            Create Project
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectEmpty;
