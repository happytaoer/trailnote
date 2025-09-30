'use client';

import { Project } from '@/types';
import { Col, Row } from 'antd';
import ProjectItem from './ProjectItem';

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
}) => {
  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={[16, 16]}>
        {projects.map((project: Project) => (
          <Col key={project.id} xs={24} sm={12} md={12} lg={8} xl={8} xxl={6}>
            <ProjectItem
              project={project}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProjectList;
