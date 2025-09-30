'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Alert, Typography, Card, Divider, Space, Result } from 'antd';
import { MailOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import NavBar from '@/components/Landing/NavBar';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [form] = Form.useForm<SignUpFormValues>();

  const router = useRouter();
  const { register, user } = useAuth();

  // If already logged in, automatically redirect to /map
  useEffect(() => {
    if (user) {
      router.push('/map');
    }
  }, [user, router]);

  const handleSignUp = async (values: SignUpFormValues) => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await register(values.email, values.password);
      if (error) {
        setError(error.message);
      } else {
        setRegisteredEmail(values.email);
        setRegistrationComplete(true);
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
      <NavBar isLoggedIn={false} />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full">
          <Card
            className="shadow-sm border border-gray-100"
            styles={{ body: { padding: '32px' } }}
          >
            {registrationComplete ? (
              <Result
                status="success"
                title="Registration Successful!"
                subTitle={
                  <>
                    We have sent a verification email to <span className="font-semibold">{registeredEmail}</span>.
                    <br />
                    Please check your inbox and click the link to activate your account.
                  </>
                }
                extra={[
                  <Button
                    type="primary"
                    key="signin"
                    onClick={() => router.push('/auth/signin')}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600 h-12 text-lg font-semibold"
                    size="large"
                    block
                  >
                    Go to Sign In
                  </Button>,
                  <Button key="home" onClick={() => router.push('/')} className="h-12 text-lg" size="large" block>
                    Return to Home
                  </Button>,
                ]}
              />
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-gray-600">
                    Join TrailNote and start mapping your adventures
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
                  name="signup"
                  onFinish={handleSignUp}
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
                  >
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="your@email.com"
                      className="border-gray-200 hover:border-gray-300 focus:border-blue-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="••••••••"
                      className="border-gray-200 hover:border-gray-300 focus:border-blue-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                      }),
                    ]}
                    className="mb-8"
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="••••••••"
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
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </Form.Item>
                </Form>

                <Divider className="my-6" />

                <div className="text-center">
                  <Space>
                    <Text className="text-gray-600">
                      Already have an account?
                    </Text>
                    <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Sign in
                    </Link>
                  </Space>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
