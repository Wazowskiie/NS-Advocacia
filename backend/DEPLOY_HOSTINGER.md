# 🚀 Deploy LexDesk na Hostinger VPS

## Pré-requisitos na VPS (Ubuntu 22.04)

### 1. Conectar na VPS
```bash
ssh root@SEU_IP_HOSTINGER
```

### 2. Instalar Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # deve mostrar v20.x
```

### 3. Instalar PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Criar banco de dados
```bash
sudo -u postgres psql
```
Dentro do psql:
```sql
CREATE USER lexdesk WITH PASSWORD 'SUA_SENHA_FORTE';
CREATE DATABASE lexdesk OWNER lexdesk;
GRANT ALL PRIVILEGES ON DATABASE lexdesk TO lexdesk;
\q
```

### 5. Instalar PM2 (mantém o servidor rodando)
```bash
sudo npm install -g pm2
```

### 6. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## Subindo o projeto

### 1. Clonar ou enviar os arquivos
```bash
# Opção A: via Git (recomendado)
cd /var/www
git clone SEU_REPOSITORIO lexdesk-backend
cd lexdesk-backend

# Opção B: via SCP do seu computador
scp -r ./lexdesk-backend root@SEU_IP:/var/www/
```

### 2. Instalar dependências
```bash
cd /var/www/lexdesk-backend
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
nano .env
```
Preencha:
```
DATABASE_URL="postgresql://lexdesk:SUA_SENHA_FORTE@localhost:5432/lexdesk"
JWT_SECRET="gere-uma-chave-aleatória-longa-aqui-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3333
NODE_ENV=production
```

### 4. Rodar as migrations e seed
```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed  # cria usuário admin inicial
```

### 5. Iniciar com PM2
```bash
pm2 start src/server.js --name lexdesk-api
pm2 save
pm2 startup  # executa o comando que aparecer
```

---

## Configurar Nginx como proxy reverso

```bash
sudo nano /etc/nginx/sites-available/lexdesk
```

Cole:
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO_OU_IP;

    location /api/ {
        proxy_pass http://localhost:3333/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lexdesk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL grátis com Certbot (HTTPS)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d SEU_DOMINIO
```

---

## Comandos úteis no dia a dia

```bash
pm2 status              # ver se está rodando
pm2 logs lexdesk-api    # ver logs em tempo real
pm2 restart lexdesk-api # reiniciar após atualização
pm2 stop lexdesk-api    # parar
```

---

## Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Cadastrar escritório + admin |
| POST | /auth/login | Login |
| GET | /auth/me | Dados do usuário logado |
| GET | /clientes | Listar clientes |
| POST | /clientes | Criar cliente |
| GET | /processos | Listar processos |
| POST | /processos | Criar processo |
| POST | /processos/:id/andamentos | Adicionar andamento |
| GET | /eventos | Listar agenda |
| POST | /eventos | Criar evento |
| GET | /financeiro | Listar lançamentos |
| POST | /financeiro | Criar lançamento |
| GET | /dashboard | Métricas do escritório |
| GET | /health | Health check |
