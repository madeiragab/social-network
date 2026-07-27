> 🇧🇷 **Português** · 🇬🇧 [English](api.md)

# Referência da API

Todos os endpoints vivem sob `/api/` e falam JSON. As rotas são geradas pelo `DefaultRouter` do DRF, então cada recurso expõe as ações padrão de listar / recuperar / criar / atualizar / excluir, salvo indicação em contrário.

**Todos os endpoints, exceto a emissão de token, exigem autenticação.**

## Autenticação

JWT via `djangorestframework-simplejwt`.

| Método | Endpoint | Corpo | Retorna |
|---|---|---|---|
| `POST` | `/api/auth/token/` | `username`, `password` | `access`, `refresh` |
| `POST` | `/api/auth/token/refresh/` | `refresh` | `access` |

Envie o token de acesso em toda requisição seguinte:

```http
Authorization: Bearer <access>
```

## Usuários e perfis

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/users/` | Listar usuários |
| `GET` | `/api/users/{id}/` | Recuperar um usuário |
| `GET` | `/api/users/profiles/` | Listar perfis |
| `GET`/`PATCH` | `/api/users/profiles/{id}/` | Ler ou atualizar um perfil (bio, avatar) |

O modelo `User` estende `AbstractUser` com um **e-mail único**. `Profile` é uma entidade `OneToOne` separada, criada explicitamente — o projeto evita signals de propósito (veja [decisions.pt-BR.md](decisions.pt-BR.md)).

## Publicações

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/posts/` | Feed / listagem de publicações |
| `POST` | `/api/posts/` | Criar uma publicação (o autor vem do token) |
| `GET` | `/api/posts/{id}/` | Recuperar uma publicação |
| `PUT`/`PATCH` | `/api/posts/{id}/` | Atualizar — **apenas o autor** |
| `DELETE` | `/api/posts/{id}/` | Excluir — **apenas o autor** |
| `GET` | `/api/posts/{id}/comments/` | Listar os comentários da publicação |
| `POST` | `/api/posts/{id}/comments/` | Adicionar um comentário |

`POST /api/posts/` aceita o texto da publicação mais seus itens de mídia em uma única requisição; a mídia é persistida como linhas separadas de `PostMedia`.

## Mídia das publicações

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/posts/media/` | Listar mídias |
| `POST` | `/api/posts/media/` | Enviar um item de mídia (`multipart/form-data`) |
| `DELETE` | `/api/posts/media/{id}/` | Remover um item de mídia |

Regras de mídia aplicadas pelo modelo:

- `media_type` é `image` ou `video`;
- `order` é explícito e **único por publicação** (`UniqueConstraint(post, order)`) — o cliente controla a ordem do carrossel, e o banco recusa duplicatas;
- arquivos nunca são embutidos no próprio `Post`.

## Reações

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/reactions/` | Listar reações |
| `POST` | `/api/reactions/` | Reagir a uma publicação |
| `PATCH` | `/api/reactions/{id}/` | Trocar o tipo da reação |
| `DELETE` | `/api/reactions/{id}/` | Remover a reação |

Tipos: `like`, `love`, `haha`, `wow`, `sad`, `angry`.

**Uma reação por usuário por publicação**, garantida no nível do banco por `UniqueConstraint(user, post)` — mudar de ideia é uma atualização, não uma segunda linha.

## Restrições de domínio que vale conhecer

Estas são garantidas pelo banco de dados, não apenas pelos serializers:

| Restrição | Modelo | Significado |
|---|---|---|
| `unique_follow` | `Follow` | Um usuário não pode seguir a mesma pessoa duas vezes |
| `no_self_follow` | `Follow` | `CheckConstraint` — você não pode seguir a si mesmo |
| `unique_media_order` | `PostMedia` | Dois itens de mídia não compartilham a mesma posição em uma publicação |
| `unique_reaction_per_user_post` | `Reaction` | Uma reação por usuário por publicação |

## Arquivos de mídia e estáticos

No modo `DEBUG`, o Django serve `/media/` e `/static/` diretamente. Em produção, esses caminhos precisam ser servidos pelo servidor web ou por um object storage.
