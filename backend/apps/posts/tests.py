"""
Post, PostMedia e Comment. Dois grupos de teste: o que o banco garante sozinho
(ordem de mídia única por post) e o que a API precisa garantir por cima
(ninguém edita nem apaga post dos outros).
"""

from datetime import timedelta

from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.posts.models import Comment, Post, PostMedia
from apps.users.models import User


def make_user(username):
    return User.objects.create_user(
        username=username, email=f'{username}@example.com', password='SenhaForte!2026'
    )


def um_dia_atras():
    return timezone.now() - timedelta(days=1)


class OrdemDaMidiaTests(TestCase):
    """A ordem da mídia é explícita e não pode empatar dentro do mesmo post."""

    def setUp(self):
        self.ana = make_user('ana')
        self.post = Post.objects.create(author=self.ana, content='texto')

    def test_duas_midias_na_mesma_posicao_do_mesmo_post_e_recusado(self):
        PostMedia.objects.create(post=self.post, media_type='image', file='a.png', order=0)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                PostMedia.objects.create(
                    post=self.post, media_type='image', file='b.png', order=0
                )

    def test_posicao_zero_pode_se_repetir_entre_posts_diferentes(self):
        outro = Post.objects.create(author=self.ana, content='outro')
        PostMedia.objects.create(post=self.post, media_type='image', file='a.png', order=0)
        PostMedia.objects.create(post=outro, media_type='image', file='b.png', order=0)
        self.assertEqual(PostMedia.objects.count(), 2)

    def test_midia_sai_ordenada_pela_posicao_e_nao_pela_criacao(self):
        PostMedia.objects.create(post=self.post, media_type='image', file='c.png', order=2)
        PostMedia.objects.create(post=self.post, media_type='image', file='a.png', order=0)
        PostMedia.objects.create(post=self.post, media_type='image', file='b.png', order=1)

        self.assertEqual(
            [m.order for m in self.post.media.all()], [0, 1, 2]
        )


class PostPelaApiTests(TestCase):
    def setUp(self):
        self.ana = make_user('ana')
        self.bruno = make_user('bruno')
        self.client = APIClient()
        self.client.force_authenticate(user=self.ana)

    def test_criar_post_grava_o_autor_a_partir_do_token(self):
        # `author` é read_only no serializer: mandar author=bruno no corpo não
        # pode fazer o post nascer em nome dele.
        resposta = self.client.post(
            '/api/posts/', {'content': 'oi', 'author': self.bruno.id}, format='json'
        )

        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(Post.objects.get().author, self.ana)

    def test_post_sem_conteudo_e_recusado(self):
        resposta = self.client.post('/api/posts/', {'content': '   '}, format='json')

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(Post.objects.count(), 0)

    def test_sem_token_nao_se_lista_post(self):
        resposta = APIClient().get('/api/posts/')

        self.assertEqual(resposta.status_code, 401)

    def test_editar_post_dos_outros_e_403(self):
        post = Post.objects.create(author=self.bruno, content='do bruno')

        resposta = self.client.patch(
            f'/api/posts/{post.id}/', {'content': 'editado'}, format='json'
        )

        self.assertEqual(resposta.status_code, 403)
        post.refresh_from_db()
        self.assertEqual(post.content, 'do bruno')

    def test_apagar_post_dos_outros_e_403(self):
        post = Post.objects.create(author=self.bruno, content='do bruno')

        resposta = self.client.delete(f'/api/posts/{post.id}/')

        self.assertEqual(resposta.status_code, 403)
        self.assertTrue(Post.objects.filter(id=post.id).exists())

    def test_apagar_o_proprio_post_funciona(self):
        post = Post.objects.create(author=self.ana, content='meu')

        resposta = self.client.delete(f'/api/posts/{post.id}/')

        self.assertEqual(resposta.status_code, 200)
        self.assertFalse(Post.objects.filter(id=post.id).exists())

    def test_feed_vem_do_mais_novo_para_o_mais_velho(self):
        antigo = Post.objects.create(author=self.ana, content='antigo')
        novo = Post.objects.create(author=self.ana, content='novo')
        # `created_at` é auto_now_add: dois posts criados no mesmo teste podem
        # cair no mesmo instante e empatar a ordenação. Separo na mão para o
        # teste medir a ordenação, e não a resolução do relógio.
        Post.objects.filter(id=antigo.id).update(created_at=um_dia_atras())

        resposta = self.client.get('/api/posts/')

        ids = [item['id'] for item in resposta.data['results']]
        self.assertEqual(ids, [novo.id, antigo.id])


class ComentarioTests(TestCase):
    def setUp(self):
        self.ana = make_user('ana')
        self.bruno = make_user('bruno')
        self.post = Post.objects.create(author=self.bruno, content='do bruno')
        self.client = APIClient()
        self.client.force_authenticate(user=self.ana)

    def test_comentar_em_post_dos_outros_e_permitido(self):
        # Comentar não é editar: a permissão de autoria vale para o post, não
        # para a conversa em volta dele.
        resposta = self.client.post(
            f'/api/posts/{self.post.id}/comments/', {'content': 'boa'}, format='json'
        )

        self.assertEqual(resposta.status_code, 201)
        comentario = Comment.objects.get()
        self.assertEqual(comentario.author, self.ana)
        self.assertEqual(comentario.post, self.post)

    def test_comentario_vazio_e_recusado(self):
        resposta = self.client.post(
            f'/api/posts/{self.post.id}/comments/', {'content': '  '}, format='json'
        )

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(Comment.objects.count(), 0)

    def test_contagem_e_ultimo_comentario_aparecem_no_post(self):
        primeiro = self.client.post(
            f'/api/posts/{self.post.id}/comments/', {'content': 'primeiro'}, format='json'
        )
        self.client.post(
            f'/api/posts/{self.post.id}/comments/', {'content': 'segundo'}, format='json'
        )
        # Mesmo motivo do feed: sem afastar os dois no tempo, o empate de
        # `created_at` deixaria o teste decidir no sorteio.
        Comment.objects.filter(id=primeiro.data['id']).update(created_at=um_dia_atras())

        resposta = self.client.get(f'/api/posts/{self.post.id}/')

        self.assertEqual(resposta.data['comment_count'], 2)
        self.assertEqual(resposta.data['latest_comment']['content'], 'segundo')
