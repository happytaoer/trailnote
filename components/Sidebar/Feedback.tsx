'use client';

import { useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { feedbackApi } from '@/lib/api';

const { TextArea } = Input;
const { Option } = Select;

interface FeedbackProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackFormData {
  content: string;
  type: 'suggestion' | 'bug' | 'feature' | 'other';
}

const Feedback: React.FC<FeedbackProps> = ({ isOpen, onClose }) => {
  const [form] = Form.useForm<FeedbackFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await feedbackApi.createFeedback({
        content: values.content,
        type: values.type,
      });

      if (error) {
        messageApi.error(`Failed to submit feedback: ${error.message}`);
      } else {
        messageApi.success('Thank you for your feedback!');
        form.resetFields();
        onClose();
      }
    } catch (error: any) {
      messageApi.error(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Send Feedback"
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ type: 'suggestion' }}
        >
          <Form.Item
            name="type"
            label="Feedback Type"
            rules={[{ required: true, message: 'Please select feedback type' }]}
          >
            <Select placeholder="Select feedback type">
              <Option value="suggestion">Suggestion</Option>
              <Option value="bug">Bug Report</Option>
              <Option value="feature">Feature Request</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Your Feedback"
            rules={[
              { required: true, message: 'Please enter your feedback' },
              { min: 10, message: 'Feedback must be at least 10 characters long' },
              { max: 1000, message: 'Feedback must not exceed 1000 characters' },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
            >
              Submit Feedback
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Feedback;
