'use client';

import { Button, Card, List, Space, Typography } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getDocs, Doc } from '@/content/docs';

const { Title, Paragraph } = Typography;

const docs: readonly Doc[] = getDocs();

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="mb-4 inline-block">
          <Button type="text" icon={<ArrowLeftOutlined />}>
            Back to Home
          </Button>
        </Link>
        <div className="mb-8">
          <Title level={1} className="text-center mb-4">
            TrailNote Docs Center
          </Title>
          <Paragraph className="text-center text-gray-600 text-lg">
            Explore TrailNote's features and learn how to get the most out of our application
          </Paragraph>
        </div>

        <Card>
          <List
            itemLayout="vertical"
            dataSource={[...docs]}
            renderItem={(doc: Doc) => (
              <List.Item
                key={doc.id}
                actions={[
                  <Space key="meta">
                    <CalendarOutlined />
                    <span>{doc.publishDate}</span>
                  </Space>
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined className="text-2xl text-blue-500" />}
                  title={
                    <Link 
                      href={`/docs/${doc.slug}`}
                      className="text-xl font-semibold hover:text-blue-600 transition-colors"
                    >
                      {doc.title}
                    </Link>
                  }
                  description={
                    <Paragraph className="text-gray-600">
                      {doc.description}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
}

