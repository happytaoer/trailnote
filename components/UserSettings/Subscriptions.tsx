'use client';

import { Button, Typography, Spin, Space, message } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

/**
 * Component for displaying and managing user subscription information
 */
const Subscriptions: React.FC = () => {
  const { user, loading } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * Handles the subscription cancellation process
   */
  const handleCancelSubscription = async (): Promise<void> => {
    try {
      messageApi.loading('Canceling subscription...');
      
      // Get the current session to extract the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Call your backend API to cancel the subscription
      const response = await fetch('/api/paddle/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: user?.subscription?.subscriptionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      messageApi.success('Subscription canceled successfully');
      
      // Force a page refresh to update the user data
      window.location.reload();
    } catch (err) {
      messageApi.error('Failed to cancel subscription. Please try again later.');
    }
  };
  
  /**
   * Handles resuming a canceled subscription
   */
  const handleResumeSubscription = async (): Promise<void> => {
    try {
      messageApi.loading('Resuming subscription...');
      
      // Get the current session to extract the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Call the API to resume the subscription
      const response = await fetch('/api/paddle/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: user?.subscription?.subscriptionId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resume subscription');
      }
      
      messageApi.success('Subscription resumed successfully');
      
      // Force a page refresh to update the user data
      window.location.reload();
    } catch (err) {
      messageApi.error('Failed to resume subscription. Please try again later.');
    }
  };

  /**
   * Renders subscription status with appropriate styling
   */
  const renderStatus = (status: string): React.ReactNode => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: 'Active' },
      trialing: { color: 'blue', text: 'Trial' },
      paused: { color: 'orange', text: 'Paused' },
      canceled: { color: 'red', text: 'Canceled' },
      past_due: { color: 'red', text: 'Past Due' },
    };

    const { color, text } = statusMap[status.toLowerCase()] || { color: 'gray', text: status };
    
    return <Text strong style={{ color }}>{text}</Text>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="subscription-container">
        <Title level={5}>Subscription</Title>
        
        {!user?.subscription ? (
          <>
            {/* Current Plan - Free */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Current Plan
                </div>
                <div className="text-sm text-gray-500">
                  You are currently on the Basic (Free) plan with limited features
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-sm font-medium text-gray-900">
                  Basic (Free)
                </div>
              </div>
            </div>
            
            {/* Plan Features */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Plan Features
                </div>
                <div className="text-sm text-gray-500">
                  Current limitations and features included in your free plan
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-sm text-gray-700 space-y-1">
                  <div>• 5 Projects</div>
                  <div>• 30 Markers per project</div>
                  <div>• 5 Routes per project</div>
                </div>
              </div>
            </div>
            
            {/* Upgrade */}
            <div className="flex items-start justify-between py-4">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Upgrade to Premium
                </div>
                <div className="text-sm text-gray-500">
                  Unlock unlimited projects, markers, and routes with premium features
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  type="primary" 
                  icon={<CrownOutlined />}
                  href="/pricing"
                >
                  View Pricing
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Current Plan - Premium */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Current Plan
                </div>
                <div className="text-sm text-gray-500">
                  You have access to all premium features and unlimited usage
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <CrownOutlined style={{ fontSize: '16px', color: '#faad14', marginRight: '6px' }} />
                  Premium
                </div>
              </div>
            </div>
            
            {/* Subscription Status */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Subscription Status
                </div>
                <div className="text-sm text-gray-500">
                  Current status of your premium subscription
                </div>
              </div>
              <div className="flex-shrink-0">
                {renderStatus(user?.subscription?.subscriptionStatus || '')}
              </div>
            </div>
            
            {/* Subscription Management */}
            <div className="flex items-start justify-between py-4">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Manage Subscription
                </div>
                <div className="text-sm text-gray-500">
                  {user?.subscription?.subscriptionStatus === 'canceled' ? (
                    'Your subscription has been canceled but remains active until the end of the billing period'
                  ) : user?.subscription?.subscriptionStatus === 'active' && user?.subscription?.scheduledChange?.action === 'cancel' ? (
                    `Scheduled to cancel on ${new Date(user.subscription.scheduledChange.effectiveAt).toLocaleDateString()}`
                  ) : (
                    'Cancel or modify your premium subscription'
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {/* Show cancel button only if subscription is active and there's no scheduled cancellation */}
                {user?.subscription?.subscriptionStatus === 'active' && !user?.subscription?.scheduledChange && (
                  <Button 
                    danger 
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </Button>
                )}
                
                {/* Show resume button for canceled subscriptions or scheduled cancellations */}
                {(user?.subscription?.subscriptionStatus === 'canceled' || 
                  (user?.subscription?.subscriptionStatus === 'active' && 
                   user?.subscription?.scheduledChange?.action === 'cancel')) && (
                  <Button 
                    type="primary" 
                    icon={<CrownOutlined />}
                    onClick={handleResumeSubscription}
                  >
                    Resume Subscription
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Subscriptions;
