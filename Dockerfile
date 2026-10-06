FROM postgres:16-alpine

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=apirest

COPY database/db.sql /docker-entrypoint-initdb.d/db.sql

EXPOSE 5432
