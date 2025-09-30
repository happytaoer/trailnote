'use client';

import React from 'react';
import { Project } from '@/types';
import { Typography, Button, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, ShareAltOutlined } from '@ant-design/icons';
import Image from 'next/image';
import styles from './project-item.module.css';
import { getStatusColor, getStatusLabel, formatDateRange } from '@/utils/project-utils';
import ShareProjectModal from './Share';
import { useProjectStore } from '@/stores/useProjectStore';

// --- Prop Interfaces ---
interface ProjectItemProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

interface ActionButtonsProps {
  onShare: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

// --- Sub-components ---
const { Text, Paragraph } = Typography;

const ActionButtons: React.FC<ActionButtonsProps> = ({ onShare, onEdit, onDelete }) => (
  <div className={styles.overlay__bottomRight}>
    <Tooltip title="Share">
      <Button
        type="text"
        size="small"
        icon={<ShareAltOutlined />}
        className={styles.actionButton}
        onClick={onShare}
      />
    </Tooltip>
    <Tooltip title="Edit">
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        className={styles.actionButton}
        onClick={onEdit}
      />
    </Tooltip>
    <Tooltip title="Delete">
      <Button
        type="text"
        size="small"
        icon={<DeleteOutlined />}
        danger
        className={`${styles.actionButton} ${styles.actionButton_danger}`}
        onClick={onDelete}
      />
    </Tooltip>
  </div>
);

const ProjectOverlay: React.FC<{ project: Project }> = ({ project }) => {
  const { openEditModal, openDeleteModal, openShareModal } = useProjectStore();
  
  return (
  <div className={styles.overlay}>
    {/* Top Right: Status and Time */}
    <div className={styles.overlay__topRight}>
      {project.status && (
        <Tag 
          color={getStatusColor(project.status)} 
          className={`${styles.statusTag} ${styles[`statusTag_${project.status}`] || ''}`}
        >
          {getStatusLabel(project.status)}
        </Tag>
      )}
      <div className={styles.timestamp}>
        {formatDateRange(project.start_date, project.end_date, project.created_at)}
      </div>
    </div>

    {/* Bottom Left: Title and Description */}
    <div className={styles.overlay__bottomLeft}>
      <Tooltip title={project.project_name}>
        <Text strong className={styles.title} style={{ color: '#ffffff' }}>
          {project.project_name}
        </Text>
      </Tooltip>
      <Tooltip title={project.description || project.ai_summary || 'No description available'}>
        <Paragraph ellipsis={{ rows: 1 }} className={styles.description} style={{ color: '#ffffff' }}>
          {project.description || project.ai_summary || 'No description available'}
        </Paragraph>
      </Tooltip>
    </div>

    {/* Bottom Right: Action Buttons */}
    <ActionButtons
      onShare={(e) => {
        e.stopPropagation();
        openShareModal(project);
      }}
      onEdit={(e) => {
        e.stopPropagation();
        openEditModal(project);
      }}
      onDelete={(e) => {
        e.stopPropagation();
        openDeleteModal(project);
      }}
    />
  </div>
  );
};

// --- Main Component ---
const ProjectItem: React.FC<ProjectItemProps> = (props) => {
  const { project, onProjectUpdate } = props;
  const { selectedProject, setSelectedProject, showShareModal, sharingProject, closeShareModal } = useProjectStore();
  const [currentProject, setCurrentProject] = React.useState(project);

  const isSelected = selectedProject?.id === project.id;

  // Update local project state when props change
  React.useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setCurrentProject(updatedProject);
    onProjectUpdate?.(updatedProject);
  };

  const handleSelectProject = () => {
    setSelectedProject(project);
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.card_selected : ''}`}
      onClick={handleSelectProject}
    >
      <div className={styles.card__cover}>
        <Image
          src={project.cover_image_url || '/map_default.png'}
          alt={project.project_name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.card__image}
          priority
          unoptimized={!project.cover_image_storage_path}
        />
        <ProjectOverlay project={project} />
      </div>
      {showShareModal && sharingProject?.id === project.id && (
        <ShareProjectModal
          open={showShareModal}
          project={currentProject}
          onCancel={closeShareModal}
          onProjectUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
};

export default ProjectItem;
