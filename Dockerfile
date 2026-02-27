FROM oven/bun:1.1.43

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .
RUN mkdir -p data
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
