# 🚀 Deploy do LexDesk Backend na Hostinger VPS

## Pré-requisitos
- VPS com Ubuntu 22.04
- Acesso SSH

---

## 1. Conectar na VPS

```bash
ssh root@SEU_IP_HOSTINGER
```

---

## 2. Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # deve mostrar v20.x
```

---

## 3. Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco e usuário
sudo -u postgres psql << SQL
CREATE USER lexdesk WITH PASSWORD 'SENHA_FORTE_AQUI';
CREATE DATABASE lexdesk_db OWNER lexdesk;
GRANT ALL PRIVILEGES ON DATABASE lexdesk_db TO lexdesk;
\q
SQL
```

---

## 4. Instalar PM2 e Nginx

```bash
npm install -g pm2
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 5. Fazer upload do projeto

```bash
# No seu computador (fora da VPS):
scp -r ./lexdesk-backend root@SEU_IP:/var/www/lexdesk-backend

# Ou via Git:
# git clone https://github.com/SEU_USUARIO/lexdesk-backend.git /var/www/lexdesk-backend
```

---

## 6. Configurar o projeto na VPS

```bash
cd /var/www/lexdesk-backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
nano .env
# Edite com seus dados:
# DATABASE_URL="postgresql://lexdesk:SENHA_FORTE_AQUI@localhost:5432/lexdesk_db"
# JWT_SECRET="GERE_COM: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
# CORS_ORIGIN="https://SEU_DOMINIO.com.br"
```

---

## 7. Rodar as migrations e seed

```bash
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
```

---

## 8. Iniciar com PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # siga as instruções para iniciar no boot
```

---

## 9. Configurar Nginx

```bash
# Copiar config
sudo cp nginx.conf /etc/nginx/sites-available/lexdesk
# Edite SEU_DOMINIO.com.br com seu domínio real
sudo nano /etc/nginx/sites-available/lexdesk

sudo ln -s /etc/nginx/sites-available/lexdesk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. SSL com Certbot (opcional mas recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d SEU_DOMINIO.com.br
```

---

## ✅ Testar

```bash
curl http://SEU_IP:3000/health
# Deve retornar: {"status":"ok","app":"LexDesk Backend","version":"1.0.0"}
```

---

## 📋 Comandos úteis

```bash
pm2 status          # ver status do servidor
pm2 logs lexdesk-backend  # ver logs em tempo real
pm2 restart lexdesk-backend  # reiniciar
pm2 stop lexdesk-backend     # parar

npx prisma studio   # interface visual do banco (porta 5555)
```
