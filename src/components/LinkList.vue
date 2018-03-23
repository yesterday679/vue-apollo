<template>
  <div>
    <h4 v-if="loading">加载中...</h4>
    <link-item
            v-for="(link,index) in orderedLinks"
            :key="link.id"
            :link="link"
            :index="index"
            :pageNumber="pageNumber">
    </link-item>
    <div v-if="isNewPage">
      <button v-show="!isFirstPage" @click="previousPage()">Previous</button>
      <button v-show="morePage" @click="nextPage()">Next</button>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import LinkItem from './LinkItem'
  import {LINKS_PER_PAGE} from '../constants/settings'
  import {ALL_LINKS_QUERY, NEW_LINKS_SUBSCRIPTION, NEW_VOTES_SUBSCRIPTION} from '../constants/graphql'

  export default {
    name: "LinkList",
    data() {
      return {
        allLinks: [],
        loading: 0,
        count: 0,
      }
    },
    methods: {
      getLinksToRender(isNewPage) {
        if (isNewPage) {
          return this.$apollo.queries.allLinks
        }
        const rankedLinks = this.$apollo.queries.allLinks.slice()
        rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
        return rankedLinks
      },
      previousPage() {
        const page = parseInt(this.$route.params.page, 10)
        if (page > 1) {
          const previousPage = page - 1
          this.$router.push({path: `/new/${previousPage}`})
        }
      },
      nextPage() {
        const page = parseInt(this.$route.params.page, 10)
        if (page < this.count / LINKS_PER_PAGE) {
          const nextPage = page + 1
          this.$router.push({path: `/new/${nextPage}`})
        }
      }
    },
    computed: {
      orderedLinks: function () {
        if (this.$route.path.includes('top')) {

          // const rankedLinks = this.allLinks.slice()
          // rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
          // return rankedLinks

          return _.orderBy(this.allLinks, [(link) => {
            return link.votes.length
          }], ["desc"])
        } else {
          return this.allLinks
        }
      },
      isFirstPage() {
        return this.$route.params.page === '1'
      },
      isNewPage() {
        return this.$route.path.includes('new')
      },
      pageNumber(index) {
        return parseInt(this.$route.params.page, 10)
      },
      morePage() {
        return parseInt(this.$route.params.page, 10) < (this.count / LINKS_PER_PAGE)
      }
    },
    components: {
      LinkItem
    },
    apollo: {
      allLinks: {
        query: ALL_LINKS_QUERY,
        variables() {
          const page = this.$route.params.page ? parseInt(this.$route.params.page, 10) : 1
          const isNewPage = this.$route.path.includes('new')
          const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
          const first = isNewPage ? LINKS_PER_PAGE : 100
          const orderBy = isNewPage ? 'createdAt_DESC' : null
          return {
            first,
            skip,
            orderBy
          }
        },
        update(data) {
          this.count = data._allLinksMeta.count
          return data.allLinks
        },
        subscribeToMore: [
          {
            document: NEW_LINKS_SUBSCRIPTION,
            updateQuery: (previous, {subscriptionData}) => {
              if (subscriptionData.data.Link) {
                const newAllLinks = [
                  subscriptionData.data.Link.node,
                  ...previous.allLinks
                ]
                const result = {
                  ...previous,
                  allLinks: newAllLinks.slice(0, LINKS_PER_PAGE)
                }
                return result
              }
            }
          },
          {
            document: NEW_VOTES_SUBSCRIPTION,
            updateQuery: (previous, {subscriptionData}) => {
              if (subscriptionData.data.Vote) {
                const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.data.Vote.node.link.id)
                const link = subscriptionData.data.Vote.node.link
                const newAllLinks = previous.allLinks.slice()
                newAllLinks[votedLinkIndex] = link
                const result = {
                  ...previous,
                  allLinks: newAllLinks.slice(0, LINKS_PER_PAGE)
                }
                return result
              }
            }
          }
        ]
      },
    }
  }
</script>

<style scoped>

</style>