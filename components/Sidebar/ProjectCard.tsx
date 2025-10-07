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

  // Render skeleton UI when loading
  const renderSkeleton = () => {
    return (
      <div className={styles.projectCardSkeleton}>
        {/* Background skeleton */}
        <div className={styles.skeletonBackground} />
        
        {/* Gradient overlay similar to real card */}
        <div className={styles.skeletonGradientOverlay} />
        
        {/* Content skeleton overlays */}
        <div className={styles.skeletonContentOverlays}>
          {/* Title and status skeleton */}
          <div className={styles.skeletonTitleOverlay}>
            <div className={styles.skeletonTitleBar} />
            <div className={styles.skeletonStatusBadge} />
          </div>
          
          {/* Description skeleton */}
          <div className={styles.skeletonDescriptionOverlay}>
            <div className={styles.skeletonDescriptionLine1} />
            <div className={styles.skeletonDescriptionLine2} />
          </div>
          
          {/* Footer skeleton */}
          <div className={styles.skeletonFooterOverlay}>
            <div className={styles.skeletonDateBadge} />
            <div className={styles.skeletonActionButtons}>
              <div className={styles.skeletonActionBtn} />
              <div className={styles.skeletonActionBtn} />
              <div className={styles.skeletonActionBtn} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      {isLoading ? (
        renderSkeleton()
      ) : currentProject ? (
        <div 
          className={getCardClasses()}
          onClick={isSharedMode ? undefined : () => setIsModalOpen(true)}
        >
          {/* Background Image */}
          <div className={styles.imageBackground}>
            <Image
              src={currentProject.cover_image_url || '/map_default.png'}
              alt={currentProject.project_name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className={styles.backgroundImage}
              style={{ objectFit: 'cover' }}
              unoptimized={!currentProject.cover_image_storage_path}
              priority={false}
            />
          </div>
          
          {/* Gradient Overlay */}
          <div className={styles.gradientOverlay} />
          
          {/* Content Overlays */}
          <div className={styles.contentOverlays}>
            {/* Title and Status */}
            <div className={styles.headerContent}>
              <h3 className={styles.projectTitle}>
                {currentProject.project_name}
              </h3>
              {!isSharedMode && (
                <span 
                  className={`${styles.statusBadge} ${styles[`status${currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1).replace('_', '')}`]}`}
                  data-testid="project-status-tag"
                >
                  {getStatusLabel(currentProject.status)}
                </span>
              )}
            </div>
            
            {/* Description */}
            {currentProject.description && (
              <div className={styles.descriptionContent}>
                <p className={styles.projectDescription}>
                  {currentProject.description}
                </p>
              </div>
            )}
            
            {/* Footer with Date and Actions */}
            <div className={styles.footerContent}>
              {/* Date */}
              {(currentProject.start_date || currentProject.end_date) && (
                <div className={styles.dateInfo}>
                  <CalendarOutlined className={styles.dateIcon} />
                  <span className={styles.dateText}>
                    {currentProject.start_date 
                      ? format(new Date(currentProject.start_date), 'MMM d, yyyy') 
                      : ''}
                    {currentProject.start_date && currentProject.end_date ? ' ~ ' : ''}
                    {currentProject.end_date 
                      ? format(new Date(currentProject.end_date), 'MMM d, yyyy') 
                      : ''}
                  </span>
                </div>
              )}
              
              {/* Action Buttons */}
              {!isSharedMode && (
                <div className={styles.actionButtonsGroup}>
                  <Tooltip title="Share" placement="top">
                    <button
                      type="button"
                      onClick={handleShareClick}
                      className={styles.actionBtn}
                    >
                      <ShareAltOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="Edit" placement="top">
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className={styles.actionBtn}
                    >
                      <EditOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="Delete" placement="top">
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                      <DeleteOutlined />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
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
