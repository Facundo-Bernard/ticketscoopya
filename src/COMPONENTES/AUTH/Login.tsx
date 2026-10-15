import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../SERVICES/authService';
import { LockIcon } from '../COMUN/Icons';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Por favor completa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      toast.success(`¡Bienvenido/a, ${response.user.nombre || 'Administrador'}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMsg = 'Credenciales incorrectas o cuenta inactiva.';
      if (!err.response || err.code === 'ERR_NETWORK') {
        errorMsg = 'No se pudo conectar con el servidor backend en http://localhost:8000. Verificá que esté encendido.';
      } else if (err.response.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3 bg-light">
      <div className="card shadow-lg border-0 rounded-4 p-4 p-sm-5" style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div
            className="brand-logo-badge mx-auto mb-3"
            style={{ width: '56px', height: '56px', fontSize: '1.6rem' }}
          >
            C
          </div>
          <h4 className="fw-bold mb-1">
            <span className="brand-title-coopya">Coopya</span>{' '}
            <span className="brand-title-sistemas">Sistemas</span>
          </h4>
          <p className="text-muted small mb-0">Panel de Administración de Tickets</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small mb-1" htmlFor="login-email">
              Correo Electrónico
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control form-control-lg rounded-3 fs-6"
              placeholder="admin@sistemas.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary small mb-1" htmlFor="login-password">
              Contraseña
            </label>
            <div className="position-relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control form-control-lg rounded-3 fs-6 pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent px-3 py-1"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Ocultar</span>
                ) : (
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Ver</span>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 rounded-3 fw-semibold shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={isLoading}
            style={{ backgroundColor: '#002B5E', borderColor: '#002B5E' }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LockIcon size={16} />
                Ingresar al Tablero
              </>
            )}
          </button>
        </form>

        <hr className="my-3 text-secondary opacity-25" />

        {/* Public Access Link */}
        <div className="text-center">
          <p className="text-muted small mb-2">¿Necesitás reportar un problema o solicitar asistencia?</p>
          <Link
            to="/crearticket-usuario"
            className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold text-decoration-none"
            style={{ color: '#d92525', borderColor: '#d92525' }}
          >
            🎫 Ir al Portal de Creación de Tickets
          </Link>
        </div>
      </div>

      <div className="text-center mt-4">
        <small className="text-muted" style={{ fontSize: '12px' }}>
          Coopya Sistemas • Sesión protegida por JWT (24 horas)
        </small>
      </div>
    </div>
  );
};

export default Login;
