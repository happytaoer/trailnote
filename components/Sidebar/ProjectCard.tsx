'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { message } from 'antd';
import { Card, Typography, Button, Tag, Skeleton, Tooltip } from 'antd';
import { 
  CalendarOutlined,
  EditOutlined, DeleteOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import ProjectModal from './ProjectSection/ProjectModal';
import DeleteProjectModal from './ProjectSection/components/DeleteProjectModal';
import EditProjectModal from './ProjectSection/components/EditProjectModal';
import ShareProjectModal from './ProjectSection/components/Share';
import ProjectEmpty from './ProjectSection/ProjectEmpty';
import { Project } from '@/types';
import { useProjectStore } from '@/stores/useProjectStore';
import { getStatusColor, getStatusLabel } from '@/utils/project-utils';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  isLoading?: boolean;
  // Shared mode props
  isSharedMode?: boolean;
  sharedProject?: Project;
}

/**
 * ProjectCard displays an overview card for projects and provides controls for viewing, editing, sharing, and deleting the selected project.
 * @param isLoading Optional loading state indicator.
 */
const ProjectCard: React.FC<ProjectCardProps> = ({
  isLoading = false,
  isSharedMode = false,
  sharedProject,
}): React.ReactNode => {
  // Get project store state and actions (only for non-shared mode)
  const {
    selectedProject: storeSelectedProject,
    showEditModal,
    showDeleteModal,
    showShareModal,
    editingProject,
    deletingProject,
    sharingProject,
    openEditModal,
    openDeleteModal,
    openShareModal,
    closeEditModal,
    closeDeleteModal,
    closeShareModal
  } = useProjectStore();
  
  // Determine which project to use based on mode
  const currentProject = isSharedMode ? sharedProject : storeSelectedProject;
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { Title } = Typography;

  // Direct action handlers using zustand (only for non-shared mode)
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProject && !isSharedMode) {
      openShareModal(currentProject);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProject && !isSharedMode) {
      openEditModal(currentProject);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProject && !isSharedMode) {
      openDeleteModal(currentProject);
    }
  };

  /**
   * Get the card style classes based on project status.
   */
  const getCardClasses = (): string => {
    const baseClasses = [styles.card, styles.projectCard];
    if (currentProject) {
      switch (currentProject.status) {
        case 'planning':
          baseClasses.push(styles.cardSelectedPlanning);
          break;
        case 'on_going':
          baseClasses.push(styles.cardSelectedOnGoing);
          break;
        case 'completed':
          baseClasses.push(styles.cardSelectedCompleted);
          break;
        default:
          baseClasses.push(styles.cardSelected);
      }
    }
    return baseClasses.join(' ');
  };

  /**
   * Get the status tag classes based on project status.
   */
  const getStatusTagClasses = (status: Project['status']): string => {
    const baseClasses = [styles.statusTag];
    switch (status) {
      case 'planning':
        baseClasses.push(styles.statusTagPlanning);
        break;
      case 'on_going':
        baseClasses.push(styles.statusTagOnGoing);
        break;
      case 'completed':
        baseClasses.push(styles.statusTagCompleted);
        break;
    }
    return baseClasses.join(' ');
  };
  
  // Render skeleton UI when loading
  const renderSkeleton = () => {
    return (
      <Card
        className={styles.projectCardSkeleton}
        styles={{ body: { padding: '16px 12px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Top part skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Skeleton.Input active style={{ width: '70%', height: 22, borderRadius: 4 }} />
                <Skeleton.Input active style={{ width: '100%', height: 18, marginTop: 8, borderRadius: 4 }} />
              </div>
              <Skeleton.Button active size="small" style={{ marginLeft: 12, width: 70, height: 24, borderRadius: 12 }} />
            </div>
            
            {/* Project description skeleton */}
            <div style={{ marginTop: 8, marginBottom: 12 }}>
              <Skeleton.Input active style={{ width: '100%', height: 16, borderRadius: 4 }} />
              <Skeleton.Input active style={{ width: '80%', height: 16, marginTop: 4, borderRadius: 4 }} />
            </div>
            
            {/* Project dates skeleton */}
            <div style={{ marginTop: 8 }}>
              <Skeleton.Input active style={{ width: 160, height: 16, borderRadius: 4 }} />
            </div>
          </div>
          
          {/* Bottom part: thumbnail skeleton */}
          <div className={`${styles.thumbnailContainer} ${styles.projectThumbnailContainer}`} style={{ marginTop: 12 }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton.Image active className={styles.skeletonImageFull} />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      {contextHolder}
      {isLoading ? (
        renderSkeleton()
      ) : currentProject ? (
        <Card
          className={getCardClasses()}
          styles={{ body: { padding: '16px 12px' } }}
          onClick={isSharedMode ? undefined : () => setIsModalOpen(true)}
          hoverable={!isSharedMode}
        >

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Top part: Project info, time and status */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* First row: Title and Status Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Title level={5} className={styles.title} style={{ flex: 1, minWidth: 0, margin: 0 }}>
                  {currentProject.project_name}
                </Title>
                {/* Only show Status Tag in non-shared mode */}
                {!isSharedMode && (
                  <Tag
                    color={getStatusColor(currentProject.status)}
                    className={getStatusTagClasses(currentProject.status)}
                    data-testid="project-status-tag"
                  >
                    {getStatusLabel(currentProject.status)}
                  </Tag>
                )}
              </div>
              
              {/* Second row: Description */}
              {currentProject.description && (
                <Typography.Paragraph
                  ellipsis={{ rows: 2, tooltip: currentProject.description }}
                  className={styles.projectDescription}
                  style={{ margin: 0 }}
                >
                  {currentProject.description}
                </Typography.Paragraph>
              )}
            {/* Project dates - only show if start_date or end_date exists */}
            {(currentProject.start_date || currentProject.end_date) && (
              <div className={styles.dateContainer}>
                <CalendarOutlined className={styles.dateIcon} />
                <Typography.Text className={styles.dateText}>
                  {currentProject.start_date 
                    ? format(new Date(currentProject.start_date), 'MMM d, yyyy') 
                    : ''}
                  {currentProject.start_date && currentProject.end_date ? ' ~ ' : ''}
                  {currentProject.end_date 
                    ? format(new Date(currentProject.end_date), 'MMM d, yyyy') 
                    : ''}
                </Typography.Text>
              </div>
            )}
          </div>
          
          {/* Bottom part: Project thumbnail image */}
          <div className={`${styles.thumbnailContainer} ${styles.projectThumbnailContainer}`} style={{ marginTop: '12px' }}>
            <Image
              src={currentProject.cover_image_url || '/map_default.png'}
              alt={currentProject.project_name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className={styles.projectThumbnail}
              style={{ objectFit: 'cover' }}
              unoptimized={!currentProject.cover_image_storage_path}
              priority={false}
            />
            
            {/* Action buttons overlay - only show in non-shared mode */}
            {!isSharedMode && (
              <div className={styles.actionButtons}>
                <Tooltip title="Share" placement="top">
                  <Button
                    type="text"
                    size="small"
                    icon={<ShareAltOutlined />}
                    onClick={handleShareClick}
                    className={styles.actionButton}
                  />
                </Tooltip>
                <Tooltip title="Edit" placement="top">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleEditClick}
                    className={styles.actionButton}
                  />
                </Tooltip>
                <Tooltip title="Delete" placement="top">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteClick}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </Card>
      ) : (
        <ProjectEmpty onClick={() => setIsModalOpen(true)} />
      )}
      
      {/* Modals - only show in non-shared mode */}
      {!isSharedMode && (
        <>
          <ProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          
          {/* Delete confirmation modal */}
          {showDeleteModal && deletingProject && (
            <DeleteProjectModal 
              open={showDeleteModal}
              project={deletingProject}
              onCancel={closeDeleteModal}
            />
          )}
          
          {/* Edit project modal */}
          {showEditModal && editingProject && (
            <EditProjectModal 
              open={showEditModal}
              project={editingProject}
              onCancel={closeEditModal}
            />
          )}
          
          {/* Share project modal */}
          {showShareModal && sharingProject && (
            <ShareProjectModal
              open={showShareModal}
              project={sharingProject}
              onCancel={closeShareModal}
            />
          )}
        </>
      )}
    </>
  );
};

export default ProjectCard;
