// This file provides compatibility between Ant Design v5 and React 19
import { theme, ConfigProvider, App, message } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

// Disable the React version check in Ant Design
// This is a workaround for the warning: [antd: compatible] antd v5 support React is 16 ~ 18
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Filter out the specific warning about React version compatibility
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('[antd: compatible]') || 
     args[0].includes('[Ant Design CSS-in-JS]'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

export { theme, ConfigProvider, StyleProvider, App, message };
