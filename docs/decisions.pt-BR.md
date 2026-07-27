> 🇧🇷 **Português** · 🇬🇧 [English](decisions.md)

# Decisões Arquiteturais

Este documento descreve as principais decisões técnicas e arquiteturais tomadas durante o projeto do sistema.

## Framework de Backend

Django e Django REST Framework foram escolhidos por oferecerem um ecossistema maduro, forte suporte de ORM e separação clara entre a lógica de domínio e as questões de HTTP.

## Modelagem de Mídia

Os arquivos de mídia foram modelados como uma entidade separada (`PostMedia`), em vez de embutidos diretamente na entidade `Post`.

Essa decisão permite:
- Múltiplas imagens e vídeos por publicação
- Separação clara entre conteúdo e mídia
- Extensibilidade futura mais fácil

## Modelagem de Reações

As reações foram modeladas como uma entidade separada, ligada tanto a `User` quanto a `Post`.

Essa abordagem torna o relacionamento explícito e evita abstrações muitos-para-muitos ocultas, que poderiam obscurecer as regras de negócio.

## Onde ficam as Regras de Negócio

Todas as regras de negócio, incluindo validação e verificações de permissão, são aplicadas no backend.

O frontend é tratado como um cliente não confiável.

## Decisões Fora de Escopo

As funcionalidades a seguir foram deixadas de fora do escopo inicial de propósito:

- Atualizações em tempo real
- Algoritmos de recomendação de conteúdo
- Processamento avançado de mídia

Elas foram excluídas para manter a implementação inicial focada e sustentável.
