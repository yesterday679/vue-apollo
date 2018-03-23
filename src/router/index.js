import Vue from 'vue'
import Router from 'vue-router'

import CreateLink from '@/components/CreateLink'
import LinkList from '@/components/LinkList'
import AppLogin from '@/components/AppLogin'
import Search from '@/components/Search'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/new/1',
      name: 'link-list',
      component: LinkList
    },
    {
      path: '/create',
      component: CreateLink
    },
    {
      path: '/new/:page',
      component: LinkList
    },
    {
      path: '/login',
      component: AppLogin
    },
    {
      path: '/search',
      component: Search
    },
    {
      path: '/top',
      component: LinkList
    }
  ],
  mode: 'history'
})
