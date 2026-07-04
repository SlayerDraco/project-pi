import { Component } from 'react';

export default class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Exhibit render failed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', padding: '24px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>
            This exhibit couldn't render — possibly an extreme value produced unstable
            geometry, or WebGL isn't available in this browser. Try a smaller value,
            or reload the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
