'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Alert, Typography, Card, Divider, Space } from 'antd';
import { MailOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import NavBar from '@/components/Landing/NavBar';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

interface SignInFormValues {
  email: string;
  password: string;
}

export default function SignInPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm<SignInFormValues>();

  const router = useRouter();
  const { login, user } = useAuth();

  // If already logged in, automatically redirect to /map
  useEffect(() => {
    if (user) {
      router.push('/map');
    }
  }, [user, router]);

  const handleSignIn = async (values: SignInFormValues) => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await login(values.email, values.password);
      if (error) {
        setError(error.message);
      } else {
        router.push('/map');
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
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Card Form Section */}
          <Card
            className="shadow-sm border border-gray-100"
            styles={{ body: { padding: '32px' } }}
          >
            {/* Error Message */}
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
              name="signin"
              onFinish={handleSignIn}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="border-gray-200 hover:border-gray-300 focus:border-blue-500"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                extra={
                  <Link
                    href="/auth/password-reset"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Forgot Password?
                  </Link>
                }
                rules={[{ required: true, message: 'Please input your password!' }]}
                className="mb-8"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            <Divider className="my-6" />

            {/* CTA Sign Up */}
            <div className="text-center">
              <Space>
                <Text className="text-gray-600">
                  Don&apos;t have an account?
                </Text>
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign up free
                </Link>
              </Space>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
