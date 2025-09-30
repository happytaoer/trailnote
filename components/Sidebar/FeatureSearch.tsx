'use client';

import { Input, Tag, Space } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface FeatureSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: 'visited' | 'not_visited' | null;
  onStatusFilterChange?: (status: 'visited' | 'not_visited' | null) => void;
  isSharedMode?: boolean;
}

const FeatureSearch: React.FC<FeatureSearchProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter = null,
  onStatusFilterChange = () => {},
  isSharedMode = false,
}) => {
  const handleStatusClick = (status: 'visited' | 'not_visited') => {
    // If the same status is clicked again, clear the filter
    if (statusFilter === status) {
      onStatusFilterChange(null);
    } else {
      onStatusFilterChange(status);
    }
  };

  return (
    <div>
      <Input
        placeholder="Search places and routes..."
        prefix={<SearchOutlined />}
        allowClear
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        size="middle"
      />
      {!isSharedMode && (
      <Space size={8} className="mt-2">
        <Tag 
          color={statusFilter === 'visited' ? 'green' : 'default'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleStatusClick('visited')}
          icon={<CheckCircleOutlined />}
          style={{ borderRadius: '12px', padding: '2px 8px' }}
        >
          Visited
        </Tag>
        <Tag 
          color={statusFilter === 'not_visited' ? 'orange' : 'default'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleStatusClick('not_visited')}
          icon={<CloseCircleOutlined />}
          style={{ borderRadius: '12px', padding: '2px 8px' }}
        >
          Not Visited
        </Tag>
      </Space>
      )}
    </div>
  );
};

export default FeatureSearch;
