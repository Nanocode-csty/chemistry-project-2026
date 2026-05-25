# Etapa 1: Construcción 
FROM node:20-alpine AS builder 

WORKDIR /app 

COPY package*.json ./ 
RUN npm install && npm cache clean --force 

COPY . . 

RUN npm run build 

# Etapa 2: Imagen final ligera 
FROM node:20-alpine AS runner 

WORKDIR /app 

ENV NODE_ENV production 
ENV NEXT_TELEMETRY_DISABLED 1 

RUN addgroup --system --gid 1001 nodejs 
RUN adduser --system --uid 1001 nextjs 

COPY --from=builder /app/public ./public 
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static 

USER nextjs 

EXPOSE 3000 

ENV PORT 3000 
ENV HOSTNAME "0.0.0.0" 

CMD ["node", "server.js"] 
