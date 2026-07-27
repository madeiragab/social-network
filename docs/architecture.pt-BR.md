> 🇧🇷 **Português** · 🇬🇧 [English](architecture.md)

# Visão Geral da Arquitetura

Este projeto é uma rede social web focada em clareza de backend, modelagem de domínio e regras de negócio explícitas.

O sistema foi projetado antes da implementação, para reduzir ambiguidade e melhorar a manutenibilidade.

## Arquitetura em Alto Nível

A aplicação segue uma arquitetura cliente-servidor clássica:

- Frontend: responsável apenas pela interação com o usuário e pelo consumo da API
- API de backend: centraliza as regras de negócio e a validação
- Banco de dados: armazenamento persistente e integridade relacional

Toda a comunicação entre frontend e backend é feita via API REST.

## Responsabilidades do Backend

O backend, construído com Django e Django REST Framework, é responsável por:

- Autenticação e autorização
- Validação de conteúdo
- Regras de tratamento de mídia
- Visibilidade do feed e controle de acesso

Nenhuma regra de negócio é aplicada exclusivamente no frontend.

## Modelo de Dados

As entidades centrais do domínio são:

- User e Profile
- Post
- PostMedia
- Reaction
- Follow

Além de `Comment`, acrescentado após a modelagem inicial.

O modelo de domínio completo está descrito no diagrama de classes UML:
[`diagrams/Class Diagram.png`](diagrams/Class%20Diagram.png)

As restrições de nível de banco (seguidas únicas, proibição de seguir a si mesmo, ordem de mídia única, uma reação por usuário por publicação) estão listadas em [api.pt-BR.md](api.pt-BR.md).

## Fluxos Principais

Dois fluxos principais do sistema foram modelados — criação de publicação e carregamento do feed — documentados nos diagramas de sequência:
[`diagrams/Sequences diagram.png`](diagrams/Sequences%20diagram.png)

## API

A superfície REST está documentada em [api.pt-BR.md](api.pt-BR.md): autenticação, endpoints por recurso e as regras que cada um aplica.
