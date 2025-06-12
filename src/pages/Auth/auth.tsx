import React, {useEffect, useState} from 'react';
import LoginForm from "../../components/LoginForm/LoginForm";
import {useAuth} from "../../contexts/GeneralContext";
import {useNavigate} from "react-router-dom";
import PageContainer from "../../components/PageContainer/PageContainer";

export default function AuthPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) navigate('/');

    setLoading(false);
  })
  return (
    <PageContainer>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="container mt-4">
          <h1 className="mb-4">Log in</h1>
          <LoginForm />
        </div>
      )}
    </PageContainer>
  );
}
