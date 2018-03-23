// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'tachyons'

import {ApolloClient} from 'apollo-client'
import {createHttpLink} from 'apollo-link-http'
import {ApolloLink} from 'apollo-link'
import VueApollo from 'vue-apollo'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {SubscriptionClient} from 'subscriptions-transport-ws'

import {GC_USER_ID, GC_AUTH_TOKEN} from './constants/settings'

const token = localStorage.getItem(GC_AUTH_TOKEN)
let userId = localStorage.getItem(GC_USER_ID)

const httpLink = new createHttpLink({uri: 'https://api.graph.cool/simple/v1/cjf1wpzqv1etf0196wimsnlx8'})
const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      authorization: `Bearer ${token}` || null,
    }
  });
  return forward(operation);
})
const link = middlewareLink.concat(httpLink);
const GRAPHQL_ENDPOINT = 'wss://subscriptions.graph.cool/v1/cjf1wpzqv1etf0196wimsnlx8'
const client = new SubscriptionClient(GRAPHQL_ENDPOINT, {
  reconnect: true,
  connectionParams: {
    authToken: token
  }
})

const apolloClient = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
  networkInterface: client
});

Vue.use(VueApollo)
Vue.config.productionTip = false

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loading',
  },
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  provide: apolloProvider.provide(),
  data: {
    userId
  },
  template: '<App/>',
  render: h => h(App)
})
