# --- Fase de Build ---
FROM node:20-alpine as build

WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia package.json e pnpm-lock.yaml e instala as dependências
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copia o restante do código
COPY . .

# Constrói a aplicação para produção
RUN pnpm run build

# --- Fase de Produção (Servidor Nginx) ---
FROM nginx:alpine as production

# Copia a build do frontend para o diretório de serviço do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Comando padrão do Nginx para iniciar
CMD ["nginx", "-g", "daemon off;"]
