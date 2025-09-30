'use client';

import { Avatar, Button, Divider, Typography } from 'antd';
import { 
  EnvironmentOutlined, 
  GroupOutlined, 
  ProjectOutlined, 
  CameraOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;



export default function MainFeaturesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-12">
          <Link href="/docs">
            <Button type="text" icon={<ArrowLeftOutlined />} className="mb-6">
              Back to Docs
            </Button>
          </Link>
          <Title level={1} className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Our Story: The Birth of TrailNote
          </Title>
          <Paragraph className="mt-6 text-xl text-gray-600 leading-8">
            Every journey deserves to be remembered, and every dream destination deserves to be planned. This is a story about dreams, travel, and code.
          </Paragraph>
          <div className="mt-6 flex items-center gap-x-4">
            <Avatar size="large" src="/tao-avatar.png" style={{ backgroundColor: '#87d068' }}>T</Avatar>
            <div>
              <Text strong>Tao, Founder</Text>
              <div className="text-gray-500">
                <span>Started in February 2025</span>
              </div>
            </div>
          </div>
        </header>

        <article className="prose prose-lg max-w-none prose-p:leading-relaxed">
          <Divider className="my-12" />

          <Title level={2}>The Spark of an Idea</Title>
          <Paragraph>
            In February 2025, the chill of winter hadn't faded, but a fire was burning within me. I love to travel, my footprints scattered across mountains and seas. But as time went on, a problem became increasingly clear: those precious memories—whether a sunrise from a mountaintop or a quaint café tucked away in a back alley—were scattered across my phone's photo album, social media, and messy notes.
          </Paragraph>
          <Paragraph>
            I longed for a dedicated digital space where I could systematically manage the places I've been and meticulously plan the corners of the world I wanted to explore next. A place that could string my footprints together like pearls and draw a blueprint for my future dreams.
          </Paragraph>

          <Title level={2} className="mt-12">The Search and the Disappointment</Title>
          <Paragraph>
            I started searching the market for a solution. I tried various map and note-taking apps, but none of them fully met my expectations. Some were powerful but overly complex; others had beautiful interfaces but lacked core features for route planning and marker management. What I wanted wasn't just a tool, but a "notebook" capable of holding all my geographical stories.
          </Paragraph>

          <Title level={2} className="mt-12">The Creative Spark</Title>
          <Paragraph>
            Then, a bold idea was born: "Why not create one myself?" An application tailored for travelers, explorers, and dreamers like me. And so, one early morning, I wrote the first line of code for TrailNote.
          </Paragraph>
          <Paragraph>
            My vision was clear: it had to be intuitive, flexible, and powerful. Users should be able to mark locations as easily as pinning a thumbtack on a real map; to freely draw, adjust, and track their routes; and to manage each trip as a separate project, keeping all related markers and routes perfectly organized. Most importantly, it had to be easy to share it all, because the most beautiful scenery is the scenery that's shared.
          </Paragraph>

          <Divider className="my-12" />

          <Title level={2}>From Zero to One, TrailNote Was Born</Title>
          <Paragraph>
            TrailNote is the product of that dream. It started from a personal need, with the hope of serving everyone who loves to explore the world. It's more than just an application; it's a promise—a promise to cherish every memory and to light up every future journey you embark on.
          </Paragraph>
          <Paragraph>
            Welcome. It's time to start writing your own map story with TrailNote.
          </Paragraph>
        </article>

        <section className="mt-16 text-center">
          <Title level={3}>Ready to Start Your Story?</Title>
          <Paragraph className="text-gray-600">
            Start your map-tagging journey now, and record every important place and moment.
          </Paragraph>
          <div className="mt-6">
            <Link href="/map">
              <Button type="primary" size="large">
                Open Map & Start Noting
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
