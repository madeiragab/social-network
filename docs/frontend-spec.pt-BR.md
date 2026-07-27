> 🇧🇷 **Português** · 🇬🇧 [English](frontend-spec.md)

# Especificação do Frontend

## Visão Geral do Projeto

Este é o frontend de uma rede social com backend em primeiro lugar.
O frontend é intencionalmente simples e focado em clareza.

## Regras de Design

- **Cores primárias**: verde (#10b981) e branco
- **Layout**: minimalista
- **Animações**: nenhuma
- **Tipografia**: sans-serif limpa
- **Responsividade**: mobile-first

## Princípios de Arquitetura

- **Backend em primeiro lugar**: todas as regras de negócio são aplicadas pelo backend
- **Cliente não confiável**: o frontend age como um cliente não confiável
- **Orientado a API**: o frontend apenas consome APIs REST
- **Sem lógica de negócio**: o frontend não contém regras de negócio nem lógica de validação
- **Simplicidade**: manter a interface e as interações simples e claras

## Funcionalidades Principais

- Autenticação (cadastro/login)
- Feed (publicações em ordem cronológica)
- Criação de publicações (texto, imagens, vídeos)
- Reações

## Stack Tecnológica

- React 18
- Vite
- Axios
- Autenticação JWT

## Integração com a API

Endpoints do backend:
- `/api/auth/` - gestão de tokens JWT
- `/api/users/` - gestão de usuários
- `/api/posts/` - publicações e mídia
- `/api/reactions/` - reações às publicações
