import { useEffect } from "react";
import { Button, Input, Card, Form, Checkbox, Spin } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginMutation, useLoadUserQuery } from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [login, { isLoading }] = useLoginMutation();
    const hasToken = !!localStorage.getItem('accessToken');
    const { data: userResponse, isLoading: isCheckingAuth } = useLoadUserQuery(undefined, {
        skip: !hasToken,
    });
    
    const navigate = useNavigate();

    const getDashboardRoute = (role: string) => {
        switch (role) {
            case 'user':
                return '/user';
            case 'admin':
                return '/admin';
            default:
                return '/login';
        }
    };

    useEffect(() => {
        if (!isCheckingAuth && userResponse?.payload?.data) {
            const userRole = userResponse.payload.data.role;
            const redirectRoute = getDashboardRoute(userRole);
            navigate(redirectRoute, { replace: true });
        }
    }, [userResponse, isCheckingAuth, navigate]);

    const handleLogin = async (values: { 
        email: string; 
        password: string; 
        remember?: boolean; 
    }) => {
        try {
            const credentials = {
                email: values.email,
                password: values.password,
                remember: values.remember || false,
            };

            const result: any = await login(credentials);

            if ('error' in result) {
                console.error('Login error:', result.error);
                const error: any = result.error;
                const status = error?.status || error?.data?.statusCode;
                const message = error?.data?.message || 'Erreur de connexion';

                switch (status) {
                    case 404:
                        Swal.fire({
                            icon: 'error',
                            title: 'Utilisateur introuvable',
                            text: message || 'Email ou mot de passe incorrect.',
                        });
                        break;

                    case 401:
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur d\'authentification',
                            text: message || 'Email ou mot de passe incorrect.',
                        });
                        break;

                    case 403:
                        Swal.fire({
                            icon: 'warning',
                            title: 'Compte en attente',
                            text: message || 'Votre compte est en attente de validation.',
                        });
                        break;

                    default:
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur de connexion',
                            text: message || 'Une erreur est survenue.',
                        });
                        break;
                }
                return;
            }

            const response = result.data;

            if (response.success && response.payload) {
                const userData = response.payload.data;
                const userRole = userData.role;

                localStorage.setItem('userEmail', userData.email);
                localStorage.setItem('userId', userData.id);
                localStorage.setItem('userRole', userRole);

                Swal.fire({
                    icon: 'success',
                    title: 'Connexion réussie',
                    text: 'Bienvenue sur USRATUL AZKAAR !',
                    timer: 2000,
                    showConfirmButton: false,
                });

                const redirectRoute = getDashboardRoute(userRole);
                
                setTimeout(() => {
                    navigate(redirectRoute, { replace: true });
                }, 1000);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur serveur',
                text: 'Une erreur interne s\'est produite. Veuillez réessayer.',
            });
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="w-full flex items-center justify-center min-h-screen bg-black">
                <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-4 text-amber-400">Vérification...</div>
                </div>
            </div>
        );
    }

    if (userResponse?.payload?.data) {
        return null;
    }

    return (
        <div className="w-full flex items-center justify-center min-h-screen bg-black p-4 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-900/20 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-900/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-6">
                        <div className="relative w-24 h-24">
                            {/* Usratul Azkaar Logo with subtle animation */}
                            <div className="absolute inset-0 w-full h-full animate-pulse opacity-30">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-amber-600 blur-xl"></div>
                            </div>
                            <img
                                src="/images/rmvLogoUsratulAzkaar.png"
                                alt="USRATUL AZKAAR Logo"
                                className="relative w-full h-full object-contain"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-light tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 mb-2">
                        USRATUL AZKAAR
                    </h1>
                    <p className="text-amber-500/80 text-sm tracking-[0.2em] uppercase">
                        Cabinet digital de développement spirituel
                    </p>
                </div>

                <Card className="shadow-2xl border border-amber-900/30 rounded-2xl overflow-hidden backdrop-blur-md bg-black/50" style={{ backgroundColor: 'transparent', backgroundImage: 'none' }}>
                    <div className="p-8">
                        <Form
                            name="vms_login_form"
                            initialValues={{ remember: false }}
                            onFinish={handleLogin}
                            layout="vertical"
                            size="large"
                        >
                            <div className="space-y-6">
                                <Form.Item
                                    label={<span className="text-amber-400 font-medium">Email</span>}
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Veuillez entrer votre email'
                                        },
                                        {
                                            type: 'email',
                                            message: 'Format d\'email invalide'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined className="text-amber-600" />}
                                        placeholder="votre@email.com"
                                        className="rounded-lg bg-gray-900 border-amber-600/30 text-white placeholder-gray-600 hover:border-amber-500 focus:border-amber-400 h-12"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-amber-400 font-medium">Mot de passe</span>}
                                    name="password"
                                    rules={[{
                                        required: true,
                                        message: 'Veuillez entrer votre mot de passe'
                                    }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="text-amber-600" />}
                                        placeholder="Votre mot de passe"
                                        className="rounded-lg bg-gray-900 border-amber-600/30 text-white placeholder-gray-600 hover:border-amber-500 focus:border-amber-400 h-12"
                                    />
                                </Form.Item>

                                <div className="flex justify-between items-center">
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox className="text-gray-400">
                                            <span className="text-sm text-gray-400">Se souvenir de moi</span>
                                        </Checkbox>
                                    </Form.Item>
                                    <a
                                        href="#"
                                        className="text-amber-400 hover:text-amber-300 transition-colors text-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            Swal.fire({
                                                icon: 'info',
                                                title: 'Mot de passe oublié ?',
                                                text: 'Contactez votre administrateur système.',
                                            });
                                        }}
                                    >
                                        Mot de passe oublié ?
                                    </a>
                                </div>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-0 rounded-lg text-lg font-semibold shadow-lg hover:shadow-amber-600/30 transition-all duration-300 text-black"
                                    >
                                        {isLoading ? 'Connexion...' : 'Se connecter'}
                                    </Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </Card>

                <div className="text-center mt-6 text-sm text-gray-600">
                    <p>
                        USRATUL AZKAAR © {new Date().getFullYear()}
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
                .animate-spin-slow { 
                    animation: spin-slow 30s linear infinite; 
                }
            `}</style>
        </div>
    );
};

export default Login;