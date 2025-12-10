import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks';

interface ErrorPageProps {
  code: '404' | '500';
  title: string;
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, title, message }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 700,
            color: 'primary.main',
            lineHeight: 1,
            mb: 2,
          }}
        >
          {code}
        </Typography>

        <Typography variant="h4" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 500, mb: 4 }}
        >
          {message}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            size="large"
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('404 - Page Not Found');
  
  return (
    <ErrorPage
      code="404"
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to the homepage."
    />
  );
};

export const ServerErrorPage: React.FC = () => {
  useDocumentTitle('500 - Server Error');
  
  return (
    <ErrorPage
      code="500"
      title="Server Error"
      message="Something went wrong on our end. Our team has been notified and is working to fix the issue. Please try again later."
    />
  );
};
