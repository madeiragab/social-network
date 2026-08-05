> 🇧🇷 **Português** · 🇬🇧 [English](README.md)

# Social Network

[![ci](https://github.com/madeiragab/social-network/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/madeiragab/social-network/actions/workflows/ci.yml)

Rede social com backend em primeiro lugar, projetada com modelagem de domínio explícita e fluxos de sistema documentados.

Este projeto foca em clareza arquitetural, aplicação das regras de negócio e um design de backend sustentável.

## Objetivos do Projeto

- Projetar o backend de uma rede social com fronteiras de domínio claras
- Modelar explicitamente os relacionamentos e as regras de negócio
- Documentar o comportamento do sistema antes da implementação
- Demonstrar maturidade de engenharia de backend

## Funcionalidades Principais

- Perfis de usuário
- Publicações com texto, links, imagens e vídeos
- Múltiplos itens de mídia por publicação
- Reações vinculadas explicitamente a usuários e publicações
- Geração de feed a partir das relações de "seguir"

## Visão Geral da Arquitetura

O sistema segue uma arquitetura cliente-servidor em que todas as regras de negócio são aplicadas no backend.

O backend foi projetado antes da implementação usando diagramas UML, para reduzir ambiguidade e melhorar a manutenibilidade.

A documentação detalhada está no diretório `/docs`.

## Documentação

| Documento | O que contém |
|---|---|
| [docs/architecture.pt-BR.md](docs/architecture.pt-BR.md) | Camadas, responsabilidades, fluxos principais |
| [docs/api.pt-BR.md](docs/api.pt-BR.md) | Todos os endpoints, autenticação e as regras que cada um aplica |
| [docs/decisions.pt-BR.md](docs/decisions.pt-BR.md) | Decisões arquiteturais e suas justificativas |
| [docs/frontend-spec.pt-BR.md](docs/frontend-spec.pt-BR.md) | Especificação do frontend |
| [docs/diagrams/](docs/diagrams) | Diagramas UML de classes e de sequência |

## Rodando localmente

Backend (API REST em Django):

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Frontend (React + Vite):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Stack Tecnológica

- Backend: Django, Django REST Framework
- Autenticação: JWT (`djangorestframework-simplejwt`)
- Banco de dados: PostgreSQL em produção, SQLite em desenvolvimento
- Frontend: React + Vite + Tailwind CSS
- Diagramas: UML (diagramas de classes e de sequência)

## Status do Projeto

Testes de integração em andamento.
A arquitetura central do backend, os modelos de banco de dados e as funcionalidades do frontend estão implementados.
