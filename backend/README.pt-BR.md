> 🇧🇷 **Português** · 🇬🇧 [English](README.md)

# Backend

API REST em Django para a rede social.

## Início Rápido

```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar o ambiente
cp .env.example .env

# Rodar as migrações
python manage.py migrate

# Iniciar o servidor
python manage.py runserver
```

Crie uma conta de administrador para navegar pelos dados em `/admin/`:

```bash
python manage.py createsuperuser
```

## Estrutura da API

- `/api/auth/` - emissão e renovação de tokens JWT
- `/api/users/` - usuários e perfis
- `/api/posts/` - publicações, mídia e comentários
- `/api/reactions/` - reações às publicações

Referência completa dos endpoints: [docs/api.pt-BR.md](../docs/api.pt-BR.md).

Veja o [README](../README.pt-BR.md) principal para detalhes de arquitetura.
