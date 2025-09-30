'use client';

import React from 'react';
import { Modal } from 'antd';
import ProjectSection from './ProjectSection';
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={"Projects"}
      width="60%"
      styles={{
        body: {
          height: 'calc(80vh - 108px)', // 80vh minus header and padding
          overflowY: 'auto',
        }
      }}
      centered
      destroyOnHidden={false}
      maskClosable={false}
    >
      <ProjectSection />
    </Modal>
  );
};

export default ProjectModal;
