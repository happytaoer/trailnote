'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Alert, Typography, Card, Divider, Space, Result } from 'antd';
import { MailOutlined, LoadingOutlined } from '@ant-design/icons';
import NavBar from '@/components/Landing/NavBar';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

interface PasswordResetFormValues {
  email: string;
}

export default function PasswordResetPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [form] = Form.useForm<PasswordResetFormValues>();

  const router = useRouter();
  const { resetPassword, user } = useAuth();

  // If already logged in, automatically redirect to /map
  useEffect(() => {
    if (user) {
      router.push('/map');
    }
  }, [user, router]);

  const handleResetPassword = async (values: PasswordResetFormValues) => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await resetPassword(values.email);
      if (error) {
        setError(error.message);
      } else {
        setResetEmailSent(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <NavBar isLoggedIn={false} />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full">
          <Card
            className="shadow-sm border border-gray-100"
            styles={{ body: { padding: '32px' } }}
          >
            {resetEmailSent ? (
              <Result
                status="success"
                title="Check Your Email"
                subTitle="Password reset email sent! Please check your inbox and follow the instructions to reset your password."
                extra={[
                  <Button
                    type="primary"
                    key="signin"
                    onClick={() => router.push('/auth/signin')}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600 h-12 text-lg font-semibold"
                    size="large"
                    block
                  >
                    Return to Sign In
                  </Button>,
                ]}
              />
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Forgot Your Password?
                  </h1>
                  <p className="text-gray-600">
                    Enter your email address and we'll send you a reset link
                  </p>
                </div>

                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="mb-6"
                  />
                )}

                <Form
                  form={form}
                  name="reset-password"
                  onFinish={handleResetPassword}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                    className="mb-8"
                  >
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="your@email.com"
                      className="border-gray-200 hover:border-gray-300 focus:border-blue-500"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      block
                      size="large"
                      icon={isLoading ? <LoadingOutlined /> : null}
                      className="h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 border-blue-600"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}

            <Divider className="my-6" />

            <div className="text-center">
              <Space>
                <Text className="text-gray-600">
                  Remember your password?
                </Text>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Login
                </Link>
              </Space>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
