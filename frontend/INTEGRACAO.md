# 🔗 Integração Frontend — NS Advocacia

## Arquivos novos (copie para js/)
- `api.js` — cliente HTTP, centraliza todas as chamadas ao backend
- `auth.js` — login, logout, proteção de rotas

## Arquivos atualizados (substitua os originais)
- `store.js` — agora busca dados reais do backend
- `data.js` — agora busca processos reais do backend
- `app.js` — agora usa API e exige login

## Arquivo novo na raiz do frontend
- `login.html` — tela de login

---

## Passo a passo

### 1. Configure o IP do backend
Abra `js/api.js` e troque na primeira linha:
```js
const API_URL = 'http://SEU_IP_VPS:3333';
```
Pelo IP real da sua VPS Hostinger. Exemplo:
```js
const API_URL = 'http://187.45.123.67:3333';
```
Se tiver domínio com HTTPS:
```js
const API_URL = 'https://api.nsadvocacia.com.br';
```

### 2. Copie os arquivos para as pastas corretas
```
login.html         → frontend/login.html
api.js             → frontend/js/api.js
auth.js            → frontend/js/auth.js
store.js           → frontend/js/store.js   (substitui o antigo)
data.js            → frontend/js/data.js    (substitui o antigo)
app.js             → frontend/js/app.js     (substitui o antigo)
```

### 3. Atualize o index.html
Adicione os novos scripts ANTES dos outros, na ordem:
```html
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
<script src="js/data.js"></script>   <!-- substitui o antigo -->
<script src="js/store.js"></script>  <!-- substitui o antigo -->
<script src="js/render.js"></script>
<script src="js/modal.js"></script>
<script src="js/nav.js"></script>
<script src="js/app.js"></script>    <!-- substitui o antigo -->
<script src="js/toast.js"></script>
<script src="js/notifications.js"></script>
<script src="js/responsive.js"></script>
```

### 4. Suba o backend na VPS e rode o seed
```bash
npm run db:seed
# usuário criado: admin@escritorio.com / senha: 123456
```
Depois troque o e-mail e senha pelo do escritório.

---

## Fluxo de funcionamento
1. Usuário acessa qualquer página → `Auth.exigirLogin()` verifica o token
2. Se não estiver logado → redireciona para `login.html`
3. Após login → token salvo no localStorage → redireciona para `index.html`
4. Dashboard carrega → `Store.carregarDashboard()` busca métricas reais
5. Tabela de processos → `carregarProcessos()` busca do banco de dados
