FROM nginx:alpine

# 작업 디렉토리 생성
WORKDIR /usr/share/nginx/html

# 기존 nginx 기본 파일 삭제
RUN rm -rf ./*

# frontend 전체 HTML/CSS/JS 복사
COPY . .

# 80 포트 오픈
EXPOSE 80
