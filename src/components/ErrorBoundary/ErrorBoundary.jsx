import React from 'react';
import { Container, Typography } from '@material-ui/core';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Typography variant="h5" align="center" style={{ marginTop: '2rem' }}>
            Something went wrong. Please refresh the page.
          </Typography>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
