// src/pages/UnderConstruction.tsx
import { Button, Result, Typography, Space, Card, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  ToolOutlined, 
  HomeOutlined, 
  ArrowLeftOutlined,
  RocketOutlined,
  BellOutlined,
  CheckCircleOutlined 
} from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Title, Paragraph, Text } = Typography;

const UnderConstruction = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 75) {
          clearInterval(timer);
          return 75;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const features = [
    { text: "Modern user interface", completed: true },
    { text: "Advanced trading system", completed: true },
    { text: "Real-time notifications", completed: false },
    { text: "Detailed analytics", completed: false },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #467eea 0%, #264ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          maxWidth: 800,
          width: '100%',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        bodyStyle={{ padding: '60px 40px' }}
      >
        <Result
          icon={
            <div style={{ 
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <img 
                src="/images/logob.png" 
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                  display: 'block'
                }}
                alt="Terminal d'Echanges Logo"
              />
              <div style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#52c41a',
                animation: 'pulse 2s infinite',
                zIndex: 1
              }} />
            </div>
          }
          title={
            <Title level={2} style={{ 
              color: '#262626', 
              marginBottom: 0,
              fontWeight: 600,
              textAlign: 'center'
            }}>
              New feature under development
            </Title>
          }
          subTitle={
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Paragraph style={{ 
                fontSize: '16px', 
                color: '#595959',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center'
              }}>
                We are actively working on this new section of <strong>Terminal d'Echanges
                </strong> to offer you an even more powerful and intuitive experience.
              </Paragraph>
            </Space>
          }
          extra={[
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate('/login')}
              key="home"
              style={{
                height: '44px',
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }}
            >
              Back to dashboard
            </Button>,
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              key="back"
              style={{
                height: '44px',
                borderRadius: '8px',
                fontWeight: 500
              }}
            >
              Previous page
            </Button>,
        
          ]}
        />

        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px', 
          padding: '20px',
          background: '#fafafa',
          borderRadius: '8px',
          border: '1px solid #f0f0f0'
        }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            💡 <strong>Tip:</strong> Follow us on social media to stay informed
            about the latest updates and new features of Terminal d'Echanges.
          </Text>
        </div>
      </Card>

      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default UnderConstruction;