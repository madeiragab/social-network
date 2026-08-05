"""
Uma reação por usuário por post. A view checa antes de gravar, mas quem garante
é a UniqueConstraint: a checagem da view é uma corrida entre duas requisições
simultâneas, a constraint não é.
"""

from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from apps.posts.models import Post
from apps.reactions.models import Reaction
from apps.users.models import User


def make_user(username):
    return User.objects.create_user(
        username=username, email=f'{username}@example.com', password='SenhaForte!2026'
    )


class UnicidadeDaReacaoTests(TestCase):
    def setUp(self):
        self.ana = make_user('ana')
        self.bruno = make_user('bruno')
        self.post = Post.objects.create(author=self.bruno, content='texto')

    def test_reagir_duas_vezes_ao_mesmo_post_e_recusado_pelo_banco(self):
        Reaction.objects.create(user=self.ana, post=self.post, reaction_type='like')
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                # Tipo diferente, mesmo par: continua sendo a segunda reação
                # da Ana naquele post.
                Reaction.objects.create(
                    user=self.ana, post=self.post, reaction_type='love'
                )

    def test_usuarios_diferentes_reagem_ao_mesmo_post(self):
        Reaction.objects.create(user=self.ana, post=self.post, reaction_type='like')
        Reaction.objects.create(user=self.bruno, post=self.post, reaction_type='love')
        self.assertEqual(Reaction.objects.count(), 2)

    def test_o_mesmo_usuario_reage_a_posts_diferentes(self):
        outro = Post.objects.create(author=self.bruno, content='outro')
        Reaction.objects.create(user=self.ana, post=self.post, reaction_type='like')
        Reaction.objects.create(user=self.ana, post=outro, reaction_type='like')
        self.assertEqual(Reaction.objects.count(), 2)


class ReacaoPelaApiTests(TestCase):
    def setUp(self):
        self.ana = make_user('ana')
        self.bruno = make_user('bruno')
        self.post = Post.objects.create(author=self.bruno, content='texto')
        self.client = APIClient()
        self.client.force_authenticate(user=self.ana)

    def test_reagir_grava_o_usuario_a_partir_do_token(self):
        resposta = self.client.post(
            '/api/reactions/',
            {'post': self.post.id, 'reaction_type': 'like', 'user': self.bruno.id},
            format='json',
        )

        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(Reaction.objects.get().user, self.ana)

    def test_reagir_duas_vezes_responde_400_em_vez_de_estourar(self):
        self.client.post(
            '/api/reactions/', {'post': self.post.id, 'reaction_type': 'like'}, format='json'
        )

        resposta = self.client.post(
            '/api/reactions/', {'post': self.post.id, 'reaction_type': 'love'}, format='json'
        )

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(Reaction.objects.count(), 1)

    def test_reagir_sem_informar_o_post_e_400(self):
        resposta = self.client.post(
            '/api/reactions/', {'reaction_type': 'like'}, format='json'
        )

        self.assertEqual(resposta.status_code, 400)

    def test_tirar_a_reacao_dos_outros_e_403(self):
        alheia = Reaction.objects.create(
            user=self.bruno, post=self.post, reaction_type='like'
        )

        resposta = self.client.delete(f'/api/reactions/{alheia.id}/')

        self.assertEqual(resposta.status_code, 403)
        self.assertTrue(Reaction.objects.filter(id=alheia.id).exists())

    def test_tirar_a_propria_reacao_funciona(self):
        minha = Reaction.objects.create(
            user=self.ana, post=self.post, reaction_type='like'
        )

        resposta = self.client.delete(f'/api/reactions/{minha.id}/')

        self.assertEqual(resposta.status_code, 200)
        self.assertFalse(Reaction.objects.filter(id=minha.id).exists())

    def test_sem_token_nao_se_reage(self):
        resposta = APIClient().post(
            '/api/reactions/', {'post': self.post.id, 'reaction_type': 'like'}, format='json'
        )

        self.assertEqual(resposta.status_code, 401)


class ReacaoNoPostTests(TestCase):
    """O feed mostra a contagem e se o leitor já reagiu."""

    def setUp(self):
        self.ana = make_user('ana')
        self.bruno = make_user('bruno')
        self.post = Post.objects.create(author=self.bruno, content='texto')

    def test_contagem_e_has_reacted_refletem_quem_esta_lendo(self):
        Reaction.objects.create(user=self.bruno, post=self.post, reaction_type='like')

        client = APIClient()
        client.force_authenticate(user=self.ana)
        resposta = client.get(f'/api/posts/{self.post.id}/')

        self.assertEqual(resposta.data['reaction_count'], 1)
        self.assertFalse(resposta.data['has_reacted'])

        Reaction.objects.create(user=self.ana, post=self.post, reaction_type='love')
        resposta = client.get(f'/api/posts/{self.post.id}/')

        self.assertEqual(resposta.data['reaction_count'], 2)
        self.assertTrue(resposta.data['has_reacted'])
