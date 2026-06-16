FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (production)
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create non-root user and set ownership
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /usr/src/app

# Environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Container healthcheck using node built-in http client
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
	CMD node -e "require('http').get('http://127.0.0.1:8000/health',res=>{process.exit(res.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

USER app

CMD ["node", "start.js"]
