# Sindaval - Sistema Jurídico

Sistema de gestão para sindicato de advogados.

## Tecnologias

- React 18
- Vite
- Redux Toolkit
- React Router DOM
- React Hook Form + Zod
- Axios

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Funcionalidades

### Área do Sindicalizado
- Dashboard pessoal
- Perfil (edição de dados)
- Histórico de pagamentos
- Carteira digital com QR Code
- Convênios disponíveis
- Notificações
- Checkout de pagamento (Mercado Pago)

### Área Administrativa
- Dashboard com estatísticas
- Gestão de usuários
- Gestão de convênios
- Relatórios exportáveis
- Envio de notificações

## Endpoints Backend

Base URL: `http://localhost:3001/api/v1`

### Autenticação
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`

### Usuários
- GET `/users/me`
- PATCH `/users/me`
- PATCH `/users/me/password`

### Pagamentos
- GET `/payments/me`
- POST `/payments/checkout`
- GET `/payments/:id`

### Carteira Digital
- GET `/digital-card/qrcode`

### Convênios
- GET `/agreements`
- POST `/agreements` (Admin)
- PATCH `/agreements/:id` (Admin)
- DELETE `/agreements/:id` (Admin)

### Admin
- GET `/admin/dashboard/stats`
- POST `/admin/reports/export`
- GET `/users` (Admin)
- POST `/users` (Admin)
- PATCH `/users/:id` (Admin)
- DELETE `/users/:id` (Admin)

### Notificações
- GET `/notifications`
- GET `/notifications/unread-count`
- PATCH `/notifications/:id/read`
- POST `/notifications` (Admin)
