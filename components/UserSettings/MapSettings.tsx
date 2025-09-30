'use client';

import { useState, useEffect } from 'react';
import { Form, Select, Button, message, Spin, Typography, ColorPicker, InputNumber, Slider } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { userSettingsApi } from '@/lib/api';
import type { Color } from 'antd/es/color-picker';

const { Option } = Select;

interface MapSettingsProps {
  isLoading?: boolean;
}

/**
 * Component for managing map layer settings
 */
const MapSettings: React.FC<MapSettingsProps> = ({ isLoading = false }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [defaultLayer, setDefaultLayer] = useState<string>('openstreetmap');
  const [defaultRouteColor, setDefaultRouteColor] = useState<string>('#3887be');
  const [defaultRouteWidth, setDefaultRouteWidth] = useState<string>('3');
  const [defaultRouteOpacity, setDefaultRouteOpacity] = useState<string>('1.0');
  const [originalValues, setOriginalValues] = useState<{ defaultLayer: string; defaultRouteColor: string; defaultRouteWidth: string; defaultRouteOpacity: string }>({ defaultLayer: 'openstreetmap', defaultRouteColor: '#3887be', defaultRouteWidth: '3', defaultRouteOpacity: '1.0' });
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { Title } = Typography;

  useEffect(() => {
    if (user && user.settings) {
      const layer = user.settings.layer || 'openstreetmap';
      const routeColor = user.settings.route_color || '#3887be';
      const routeWidth = user.settings.route_width || '3';
      const routeOpacity = user.settings.route_opacity || '1.0';
      
      setDefaultLayer(layer);
      setDefaultRouteColor(routeColor);
      setDefaultRouteWidth(routeWidth);
      setDefaultRouteOpacity(routeOpacity);
      
      const values = {
        defaultLayer: layer,
        defaultRouteColor: routeColor,
        defaultRouteWidth: routeWidth,
        defaultRouteOpacity: routeOpacity
      };
      
      setOriginalValues(values);
      form.setFieldsValue(values);
      setHasChanges(false);
    }
  }, [user, form]);

  // Check for changes
  useEffect(() => {
    const currentValues = {
      defaultLayer,
      defaultRouteColor,
      defaultRouteWidth,
      defaultRouteOpacity
    };
    
    const changed = JSON.stringify(currentValues) !== JSON.stringify(originalValues);
    setHasChanges(changed);
  }, [defaultLayer, defaultRouteColor, defaultRouteWidth, defaultRouteOpacity, originalValues]);

  const handleSave = async (): Promise<void> => {
    if (!user) return;

    try {
      setSaveLoading(true);
      await userSettingsApi.updateUserSettings({
        layer: defaultLayer,
        route_color: defaultRouteColor,
        route_width: defaultRouteWidth,
        route_opacity: defaultRouteOpacity
      });
      
      const newValues = {
        defaultLayer,
        defaultRouteColor,
        defaultRouteWidth,
        defaultRouteOpacity
      };
      
      setOriginalValues(newValues);
      setHasChanges(false);
      messageApi.success('Map settings saved successfully');
    } catch (error) {
      messageApi.error('Failed to save map settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = (): void => {
    setDefaultLayer(originalValues.defaultLayer);
    setDefaultRouteColor(originalValues.defaultRouteColor);
    setDefaultRouteWidth(originalValues.defaultRouteWidth);
    form.setFieldsValue(originalValues);
    setHasChanges(false);
  };

  return (
    <>
      {contextHolder}
      <div className="map-settings">
        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="mb-0">Map Settings</Title>
          {hasChanges && (
            <div className="flex gap-2">
              <Button onClick={handleCancel} disabled={saveLoading}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleSave} loading={saveLoading}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
        <Spin spinning={isLoading}>
          <Form
            form={form}
            initialValues={{ defaultLayer, defaultRouteColor, defaultRouteWidth }}
          >
            {/* Default Map Layer */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Default Map Layer
                </div>
                <div className="text-sm text-gray-500">
                  Choose the default map layer that will be displayed when you open the map
                </div>
              </div>
              <div className="flex-shrink-0">
                <Form.Item
                  name="defaultLayer"
                  className="mb-0"
                  rules={[{ required: false, message: 'Please select a default map layer' }]}
                >
                  <Select 
                    placeholder="Select a default map layer" 
                    style={{ width: 200 }}
                    value={defaultLayer}
                    onChange={(value: string) => {
                      setDefaultLayer(value);
                      form.setFieldValue('defaultLayer', value);
                    }}
                  >
                    <Option value="openstreetmap">OpenStreetMap</Option>
                    <Option value="mapbox">Mapbox</Option>
                    <Option value="mapbox satellite">Mapbox Satellite</Option>
                    <Option value="opentopomap">OpenTopoMap</Option>
                    <Option value="cyclosm">CycleOSM</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
            
            {/* Default Route Color */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Default Route Color
                </div>
                <div className="text-sm text-gray-500">
                  Set the default color for new routes you create on the map
                </div>
              </div>
              <div className="flex-shrink-0">
                <Form.Item
                  name="defaultRouteColor"
                  className="mb-0"
                  rules={[{ required: false, message: 'Please select a default route color' }]}
                >
                  <ColorPicker
                    value={defaultRouteColor}
                    onChange={(color: Color) => {
                      const hexColor = color.toHexString();
                      setDefaultRouteColor(hexColor);
                      form.setFieldValue('defaultRouteColor', hexColor);
                    }}
                    showText
                    format="hex"
                    presets={[
                      {
                        label: 'Recommended',
                        colors: [
                          '#3887be',
                          '#ff4d4f',
                          '#52c41a',
                          '#faad14',
                          '#722ed1',
                          '#eb2f96',
                          '#13c2c2',
                          '#fa8c16'
                        ]
                      }
                    ]}
                  />
                </Form.Item>
              </div>
            </div>
            
            {/* Default Route Width */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Default Route Width
                </div>
                <div className="text-sm text-gray-500">
                  Set the default line width for new routes (1-10 pixels)
                </div>
              </div>
              <div className="flex-shrink-0">
                <Form.Item
                  name="defaultRouteWidth"
                  className="mb-0"
                  rules={[{ required: false, message: 'Please select a default route width' }]}
                >
                  <InputNumber
                    min={1}
                    max={10}
                    step={1}
                    value={parseInt(defaultRouteWidth)}
                    onChange={(value: number | null) => {
                      const widthValue = value?.toString() || '3';
                      setDefaultRouteWidth(widthValue);
                      form.setFieldValue('defaultRouteWidth', widthValue);
                    }}
                    addonAfter="px"
                    placeholder="Route width"
                    style={{ width: 120 }}
                  />
                </Form.Item>
              </div>
            </div>
            
            {/* Default Route Opacity */}
            <div className="flex items-start justify-between py-4 border-b border-gray-100">
              <div className="flex-1 pr-8">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Default Route Opacity
                </div>
                <div className="text-sm text-gray-500">
                  Set the default opacity for new routes (0% transparent to 100% opaque)
                </div>
              </div>
              <div className="flex-shrink-0">
                <Form.Item
                  name="defaultRouteOpacity"
                  className="mb-0"
                  rules={[{ required: false, message: 'Please select a default route opacity' }]}
                >
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={parseFloat(defaultRouteOpacity)}
                    onChange={(value: number) => {
                      const opacityValue = value.toString();
                      setDefaultRouteOpacity(opacityValue);
                      form.setFieldValue('defaultRouteOpacity', opacityValue);
                    }}
                    tooltip={{
                      formatter: (value) => `${Math.round((value || 0) * 100)}%`
                    }}
                    style={{ width: 120 }}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </div>
    </>
  );
};

export default MapSettings;
