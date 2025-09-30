'use client';

import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface ProjectSearchBarProps {
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  onCreateProject: () => void;
}

const ProjectSearchBar: React.FC<ProjectSearchBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  onCreateProject
}) => {

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Header with New Project button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tag 
              color={statusFilter === null ? 'processing' : undefined}
              style={{ cursor: 'pointer' }}
              onClick={() => onStatusFilterChange(null)}
            >
              All
            </Tag>
            <Tag 
              color={statusFilter === 'planning' ? 'blue' : undefined}
              style={{ 
                cursor: 'pointer',
                ...(statusFilter === 'planning' && {
                  backgroundColor: 'rgba(24, 144, 255, 0.8)',
                  borderColor: 'rgba(24, 144, 255, 0.6)',
                  color: '#ffffff'
                })
              }}
              onClick={() => onStatusFilterChange('planning')}
            >
              Planning
            </Tag>
            <Tag 
              color={statusFilter === 'on_going' ? 'orange' : undefined}
              style={{ 
                cursor: 'pointer',
                ...(statusFilter === 'on_going' && {
                  backgroundColor: 'rgba(250, 173, 20, 0.8)',
                  borderColor: 'rgba(250, 173, 20, 0.6)',
                  color: '#ffffff'
                })
              }}
              onClick={() => onStatusFilterChange('on_going')}
            >
              On Going
            </Tag>
            <Tag 
              color={statusFilter === 'completed' ? 'green' : undefined}
              style={{ 
                cursor: 'pointer',
                ...(statusFilter === 'completed' && {
                  backgroundColor: 'rgba(82, 196, 26, 0.8)',
                  borderColor: 'rgba(82, 196, 26, 0.6)',
                  color: '#ffffff'
                })
              }}
              onClick={() => onStatusFilterChange('completed')}
            >
              Completed
            </Tag>
          </div>
          
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={onCreateProject}
          >
            New Project
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProjectSearchBar;
