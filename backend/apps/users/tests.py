"""
O README diz que as regras de negócio moram no banco, não na aplicação. Esses
testes existem para provar isso: cada regra é violada por baixo da API, direto
no ORM, e o banco precisa recusar. Se um dia alguém trocar a UniqueConstraint
por uma checagem em Python no serializer, esses testes quebram.
"""

from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import Follow, Profile, User


def make_user(username, **extra):
    return User.objects.create_user(
        username=username,
        email=f'{username}@example.com',
        password='SenhaForte!2026',
        **extra,
    )


class ConstraintsDeBancoTests(TestCase):
    """As regras do domínio são constraints, e constraints não têm exceção."""

    def setUp(self):
        self.ana = make_user('ana')
        self.bruno = make_user('bruno')

    def test_seguir_duas_vezes_o_mesmo_usuario_e_recusado_pelo_banco(self):
        Follow.objects.create(follower=self.ana, following=self.bruno)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Follow.objects.create(follower=self.ana, following=self.bruno)

    def test_seguir_a_si_mesmo_e_recusado_pelo_banco(self):
        # CheckConstraint no_self_follow. A view também barra, mas a view não é
        # o único caminho até a tabela: shell, admin e migração de dados também
        # chegam lá.
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Follow.objects.create(follower=self.ana, following=self.ana)

    def test_email_duplicado_e_recusado_pelo_banco(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                User.objects.create_user(
                    username='outra', email='ana@example.com', password='SenhaForte!2026'
                )

    def test_seguir_de_volta_e_permitido(self):
        # A unicidade é do par ordenado: (ana → bruno) e (bruno → ana) são
        # relações diferentes. Vale testar para não "consertar" a constraint
        # um dia trocando-a por um par não ordenado.
        Follow.objects.create(follower=self.ana, following=self.bruno)
        Follow.objects.create(follower=self.bruno, following=self.ana)
        self.assertEqual(Follow.objects.count(), 2)


class PerfilTests(TestCase):
    """Sem signals: o Profile é criado explicitamente, como o domínio manda."""

    def test_usuario_nasce_sem_profile(self):
        ana = make_user('ana')
        self.assertFalse(Profile.objects.filter(user=ana).exists())

    def test_endpoint_me_cria_o_profile_na_primeira_visita(self):
        ana = make_user('ana')
        client = APIClient()
        client.force_authenticate(user=ana)

        resposta = client.get('/api/users/profiles/me/')

        self.assertEqual(resposta.status_code, 200)
        self.assertTrue(Profile.objects.filter(user=ana).exists())


class SeguirPelaApiTests(TestCase):
    def setUp(self):
        self.ana = make_user('ana')
        self.bruno = make_user('bruno')
        self.client = APIClient()
        self.client.force_authenticate(user=self.ana)

    def test_seguir_alguem_cria_a_relacao(self):
        resposta = self.client.post(f'/api/users/{self.bruno.id}/follow/')

        self.assertEqual(resposta.status_code, 201)
        self.assertTrue(
            Follow.objects.filter(follower=self.ana, following=self.bruno).exists()
        )

    def test_seguir_duas_vezes_responde_400_em_vez_de_estourar(self):
        self.client.post(f'/api/users/{self.bruno.id}/follow/')

        resposta = self.client.post(f'/api/users/{self.bruno.id}/follow/')

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(Follow.objects.count(), 1)

    def test_seguir_a_si_mesmo_responde_400(self):
        resposta = self.client.post(f'/api/users/{self.ana.id}/follow/')

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(Follow.objects.count(), 0)

    def test_deixar_de_seguir_remove_a_relacao(self):
        Follow.objects.create(follower=self.ana, following=self.bruno)

        resposta = self.client.post(f'/api/users/{self.bruno.id}/unfollow/')

        self.assertEqual(resposta.status_code, 204)
        self.assertEqual(Follow.objects.count(), 0)

    def test_deixar_de_seguir_quem_nao_se_segue_responde_400(self):
        resposta = self.client.post(f'/api/users/{self.bruno.id}/unfollow/')

        self.assertEqual(resposta.status_code, 400)


class AutenticacaoTests(TestCase):
    def test_criar_conta_nao_exige_token(self):
        resposta = APIClient().post(
            '/api/users/',
            {
                'username': 'nova',
                'email': 'nova@example.com',
                'password': 'SenhaForte!2026',
            },
            format='json',
        )

        self.assertEqual(resposta.status_code, 201)

    def test_listar_usuarios_sem_token_e_recusado(self):
        resposta = APIClient().get('/api/users/')

        self.assertEqual(resposta.status_code, 401)

    def test_token_e_emitido_para_credencial_valida(self):
        make_user('ana')

        resposta = APIClient().post(
            '/api/auth/token/',
            {'username': 'ana', 'password': 'SenhaForte!2026'},
            format='json',
        )

        self.assertEqual(resposta.status_code, 200)
        self.assertIn('access', resposta.data)
        self.assertIn('refresh', resposta.data)
