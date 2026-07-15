// src/pages/Unauthorized.tsx
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403 - Unauthorized access"
      subTitle="Sorry, you do not have the necessary permissions to access this page."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Back to home
        </Button>
      }
    />
  );
};

export default Unauthorized;