import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: 'ddf5feee7a8349a2a468bf2d3f32096b',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: '1dea0269-80a9-443d-9dac-67dc9d567558',

  // basic site info (required)
  name: 'Finnternet',
  domain: 'finnternet.com',
  author: 'Chris Finn',

  // open graph metadata (optional)
  description: "Chris Finn's corner of the Internet",

  // social usernames (optional)
  twitter: 'thefinnomenon',
  github: 'thefinnomenon',
  linkedin: 'cpfinn',

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: 'https://finnternet.com/page-icon.png',
  defaultPageCover: 'https://finnternet.com/page-cover.jpg',
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: null,

  pageUrlAdditions: null,

  // whether to use the default notion navigation style or a custom one with links to
  // important pages
  navigationStyle: 'custom',
  navigationLinks: [
    {
      title: 'About',
      pageId: '4e7e3bce623c4788b17189f4910d869b'
    },
    {
      title: 'Contact',
      pageId: 'acb3fe0f89384fcead083da1165510a3'
    }
  ]
})
