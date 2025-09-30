'use client';

import { Button, Card, Typography, Steps, Alert, Space, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Paragraph, Text } = Typography;

export default function FreehandDrawingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/docs" className="mb-4 inline-block">
          <Button type="text" icon={<ArrowLeftOutlined />}>
            Back to Docs
          </Button>
        </Link>

        <Card className="mb-6">
          <div className="text-center mb-8">
            <EditOutlined className="text-6xl text-blue-500 mb-4" />
            <Title level={1} className="mb-4">
              Freehand Drawing: Create Routes with Your Finger
            </Title>
            <Paragraph className="text-lg text-gray-600">
              Learn how to use TrailNote's innovative freehand drawing feature to create custom routes by drawing directly on the map.
            </Paragraph>
            <Text type="secondary">Published on January 20, 2025</Text>
          </div>

          <Alert
            message="Beta Feature"
            description="The freehand drawing feature is currently in beta. We're continuously improving it based on user feedback."
            type="info"
            showIcon
            className="mb-6"
          />

          <Divider orientation="left">
            <Title level={2}>What is Freehand Drawing?</Title>
          </Divider>

          <Paragraph className="text-base leading-relaxed mb-6">
            Freehand drawing allows you to create custom routes by drawing directly on the map with your mouse or finger. 
            This feature is perfect for:
          </Paragraph>

          <ul className="list-disc list-inside mb-6 space-y-2">
            <li><strong>Walking paths:</strong> Trace the exact path you took through a park or city</li>
            <li><strong>Scenic routes:</strong> Draw winding roads through mountains or countryside</li>
            <li><strong>Custom trails:</strong> Create unique hiking or biking routes</li>
            <li><strong>Irregular paths:</strong> Capture routes that don't follow standard roads</li>
          </ul>

          <Divider orientation="left">
            <Title level={2}>How to Use Freehand Drawing</Title>
          </Divider>

          <Steps
            direction="vertical"
            size="small"
            current={-1}
            className="mb-8"
            items={[
              {
                title: 'Access the Drawing Tool',
                description: (
                  <div>
                    <Paragraph>
                      Look for the <EditOutlined className="text-blue-500" /> <strong>brush icon</strong> in the map controls. 
                      The tooltip will show "Freehand Draw (Beta)".
                    </Paragraph>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <Image
                        src="/hand_draw1.png"
                        alt="Freehand drawing button location in map controls"
                        width={400}
                        height={200}
                        className="rounded-lg shadow-sm"
                      />
                      <Text type="secondary" className="block mt-2 text-sm">
                        The brush icon in the map controls - click to enter freehand drawing mode
                      </Text>
                    </div>
                  </div>
                ),
                icon: <EditOutlined />
              },
              {
                title: 'Enter Drawing Mode',
                description: (
                  <div>
                    <Paragraph>
                      Click the brush button to enter freehand drawing mode. The button will turn blue and your cursor 
                      will change to a crosshair (+) to indicate you're in drawing mode.
                    </Paragraph>
                  </div>
                ),
                icon: <InfoCircleOutlined />
              },
              {
                title: 'Draw Your Route',
                description: (
                  <div>
                    <Paragraph>
                      <strong>Click and drag</strong> on the map to draw your route:
                    </Paragraph>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Press and hold the mouse button (or touch and hold on mobile)</li>
                      <li>Drag to draw your path - you'll see a dashed line following your movement</li>
                      <li>Release the mouse button (or lift your finger) to complete the route</li>
                    </ul>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <Image
                        src="/hand_draw2.png"
                        alt="Example of drawing a route line on the map"
                        width={500}
                        height={300}
                        className="rounded-lg shadow-sm"
                      />
                      <Text type="secondary" className="block mt-2 text-sm">
                        Example of drawing a custom route - the dashed line shows your drawing in progress
                      </Text>
                    </div>
                  </div>
                ),
                icon: <EditOutlined />
              },
              {
                title: 'Automatic Save',
                description: (
                  <div>
                    <Paragraph>
                      When you finish drawing, TrailNote automatically:
                    </Paragraph>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Calculates the total distance of your route</li>
                      <li>Applies your default route color and style settings</li>
                      <li>Saves the route to your project with a timestamp name</li>
                      <li>Shows a success message</li>
                    </ul>
                  </div>
                ),
                icon: <CheckCircleOutlined />
              }
            ]}
          />

          <Divider orientation="left">
            <Title level={2}>Tips for Better Results</Title>
          </Divider>

          <Card className="mb-6" size="small">
            <Space direction="vertical" size="middle" className="w-full">
              <div>
                <Title level={4} className="text-green-600 mb-2">
                  ✅ Best Practices
                </Title>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Draw smoothly:</strong> Move your mouse/finger in steady, continuous motions</li>
                  <li><strong>Zoom in first:</strong> Zoom into your area for more precise drawing</li>
                  <li><strong>Use appropriate speed:</strong> Don't draw too fast - moderate speed works best</li>
                  <li><strong>Check your route:</strong> The dashed preview line shows exactly what you're drawing</li>
                </ul>
              </div>

              <div>
                <Title level={4} className="text-orange-600 mb-2">
                  ⚠️ Things to Avoid
                </Title>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Very short routes:</strong> Routes need at least 2 points to be saved</li>
                  <li><strong>Drawing too fast:</strong> This might result in jagged or incomplete lines</li>
                  <li><strong>Forgetting to exit:</strong> Click the brush button again to exit drawing mode</li>
                </ul>
              </div>
            </Space>
          </Card>

          <Divider orientation="left">
            <Title level={2}>Technical Details</Title>
          </Divider>

          <Paragraph className="text-base leading-relaxed mb-4">
            The freehand drawing feature uses advanced web technologies to provide a smooth drawing experience:
          </Paragraph>

          <ul className="list-disc list-inside mb-6 space-y-2">
            <li><strong>Real-time tracking:</strong> Mouse/touch movements are captured in real-time</li>
            <li><strong>Automatic smoothing:</strong> The system automatically smooths your drawn path</li>
            <li><strong>Distance calculation:</strong> Uses precise geographic calculations for accurate distances</li>
            <li><strong>Style inheritance:</strong> Automatically applies your preferred route colors and settings</li>
          </ul>

          <Divider orientation="left">
            <Title level={2}>Editing and Managing Drawn Routes</Title>
          </Divider>

          <Paragraph className="text-base leading-relaxed mb-4">
            Once you've created a freehand route, you can manage it just like any other route:
          </Paragraph>

          <ul className="list-disc list-inside mb-6 space-y-2">
            <li><strong>Rename:</strong> Click on the route to open the info panel and edit the name</li>
            <li><strong>Add description:</strong> Add notes about your route in the description field</li>
            <li><strong>Change style:</strong> Modify colors, width, and opacity in the route settings</li>
            <li><strong>Mark as visited:</strong> Update the status when you've completed the route</li>
            <li><strong>Delete:</strong> Remove routes you no longer need</li>
          </ul>

          <Alert
            message="Need Help?"
            description="If you encounter any issues with freehand drawing or have suggestions for improvement, please contact our support team. Your feedback helps us make this feature even better!"
            type="success"
            showIcon
            className="mb-6"
          />

          <div className="text-center">
            <Space size="large">
              <Link href="/docs">
                <Button type="default" icon={<ArrowLeftOutlined />}>
                  Back to Docs
                </Button>
              </Link>
              <Link href="/">
                <Button type="primary">
                  Try Freehand Drawing
                </Button>
              </Link>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
