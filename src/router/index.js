import { createRouter, createWebHistory } from 'vue-router'

const sections = [
  ['/comprar', 'buy', 'Comprar Cripto'],
  ['/educacao', 'education', 'Educação'],
  ['/mais', 'more', 'Central da plataforma'],
  ['/perfil', 'profile', 'Perfil'],
  ['/notificacoes', 'notifications', 'Notificações'],
  ['/carteira', 'wallet', 'Carteira demonstrativa'],
]
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('@/views/Home.vue'), meta: { template: 'DefaultTemplate', title: 'Trade' } },
    ...sections.map(([path, name, title]) => ({ path, name, component: () => import('@/views/PlatformSection.vue'), meta: { template: 'DefaultTemplate', title } })),
    { path: '/:pathMatch(.*)*', redirect: '/mais' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
router.afterEach(to => { document.title = `${to.meta.title} | Crypto Eye` })
export default router
