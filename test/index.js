import test from 'tape';
import path from 'path';
import _ from 'lodash';
import creativeSemanticStore from '../src';

const activeDir = path.resolve(__dirname, 'fixtures', 'active');

const activeLicense = {
  url: 'https://creativecommons.org/licenses/by/4.0/',
  description: 'Creative Commons Attribution 4.0 International',
  name: 'CC BY 4.0',
  'twitter:hastag': '#CCBY',
  alternateName: 'CC BY',
};

const activeAuthor = {
  name: 'Adele Smith',
  url: 'http:/mysite.com/adele-smith',
  'twitter:username': '@adelesmith',
};

const onGenerateId = (slug, prefix, category) =>
   `${category}/${slug}-${prefix}-789`
;

const onGenerateHomepage = (slug, prefix, category) =>
   `http://mysite.com/page/${category}/${slug}-${prefix}-789`
;

const onGenerateVersion = (slug, prefix, category, id) =>
   `${id}-56`
;

const onUpdateTime = () =>
   '2011-12-19T15:28:46.493Z'
;


const categoryMapping = [['aphrodite', 'venus'], ['beauty', 'venus'], ['zeus', 'jupiter']];
const typeOfContributionMapping = [
  ['http://website.com/contrib/typeOfContribution/writing', {
    name: 'writing',
    url: 'http://website.com/typeOfContribution/writing',
  }],
  ['http://website.com/contrib/typeOfContribution/translating', {
    name: 'translating',
    url: 'http://website.com/typeOfContribution/translating',
  }],
];

const typeOfWorkMapping = [
  ['http://id.website.com/thing/comic-script', {
    name: 'Comic Script',
    url: 'http://website.com/thing/comic-script',
  }],
  ['http://id.website.com/thing/fictional-character', {
    name: 'Comic Script',
    url: 'http://website.com/thing/fictional-character',
  }],
  ['http://id.website.com/thing/keyword', {
    name: 'Keyword',
    url: 'http://website.com/thing/keyword',
  }],
];

const conf = {
  userConfig: {
    folders: ['/proj1', '/proj2/alpha'],
    activeFolder: 'active',
    activePrefix: '1234',
    activeAuthor,
    activeLicense,
    activeLanguage: 'en',
  },

  appConfig: {
    categoryMapping,
    typeOfContributionMapping,
    typeOfWorkMapping,
    categorySrcPredicate: 'http://website.com/typeOfWork',
    idPredicate: 'http://website.com/id',
    updatedPredicate: 'http://website.com/updated',
    headlinePredicate: 'http://website.com/headline',
    alternativeHeadlinePredicate: 'http://website.com/alternativeHeadline',
    descriptionPredicate: 'http://website.com/description',
    homepagePredicate: 'http://website.com/homepage',
    typeOfWorkPredicate: 'http://website.com/type-of-work',
    typeOfContributionPredicate: 'http://website.com/type-of-contribution',
    keywordPredicate: 'http://id.website.com/thing/keyword',
    onGenerateId,
    onGenerateHomepage,
    onGenerateVersion,
    onUpdateTime,
  },
};
test('creativeSemanticStore should validate config', (t) => {
  t.plan(1);
  t.notEqual(creativeSemanticStore(conf), null, 'return a store');
});

test('creativeSemanticStore should load a category', (t) => {
  const store = creativeSemanticStore(conf);
  const opts = { category: 'venus', folder: activeDir };
  t.plan(4);
  store.loadActiveCategoryTriples(opts, (err, success) => {
    t.ok(success, 'should be successful');
    t.equal(_.size(store.activeTriples.venus), 2, 'should have the exact number of subject sections');
    t.deepEqual(store.categories, ['jupiter', 'venus'], 'should have categories');
    t.deepEqual(store.activeTriples.venus.get('http://www.site.org/version/125/'),
      [{ graph: '',
        object: '"Dave Beckett"',
        predicate: 'http://purl.org/dc/elements/1.1/creator',
        subject: 'http://www.site.org/version/125/' },
      { graph: '',
        object: '"Art Barstow"',
        predicate: 'http://purl.org/dc/elements/1.1/creator',
        subject: 'http://www.site.org/version/125/' },
      { graph: '',
        object: 'http://www.w3.org/',
        predicate: 'http://purl.org/dc/elements/1.1/publisher',
        subject: 'http://www.site.org/version/125/' },
      ]);
  });
});

test('creativeSemanticStore should load an active history for version', (t) => {
  const store = creativeSemanticStore(conf);
  const opts = { version: '125', folder: activeDir };
  t.plan(2);
  store.loadActiveHistory(opts, (err, success) => {
    t.ok(success, 'should be successful');
    t.equal(store.activeHistory['125'].history[0].headline, 'London gathering');
  });
});

test('creativeSemanticStore should insert entity', (t) => {
  const store = creativeSemanticStore(conf);
  const opts = {
    slug: 'helpful-slug',
    couples: [
      { predicate: 'http:/a.com/a', object: '"a"' },
      { predicate: 'http://website.com/typeOfWork', object: '"zeus"' },
      { predicate: 'http:/a.com/b', object: '"b"' },
      { predicate: 'http:/a.com/c', object: '"c"' },
      { predicate: 'http://website.com/headline', object: '"some headline"' },
      { predicate: 'http://website.com/description', object: '"some desc"' },
      { predicate: 'http://website.com/type-of-contribution', object: 'http://website.com/contrib/typeOfContribution/writing' },
      { predicate: 'http://website.com/type-of-work', object: 'http://id.website.com/thing/comic-script' },
      { predicate: 'http://id.website.com/thing/keyword', object: 'http://id.website.com/thing/keyword1' },
      { predicate: 'http://id.website.com/thing/keyword', object: 'http://id.website.com/thing/keyword2' },
    ] };
  t.plan(2);
  const entity = store.insertEntity(opts);
  const subject = 'jupiter/helpful-slug-1234-789-56';
  const expectedTriples = [
      { object: '"a"', predicate: 'http:/a.com/a', subject },
      { object: '"zeus"', predicate: 'http://website.com/typeOfWork', subject },
      { object: '"b"', predicate: 'http:/a.com/b', subject },
      { object: '"c"', predicate: 'http:/a.com/c', subject },
      { object: '"some headline"', predicate: 'http://website.com/headline', subject },
      { object: '"some desc"', predicate: 'http://website.com/description', subject },
      { object: 'http://website.com/contrib/typeOfContribution/writing', predicate: 'http://website.com/type-of-contribution', subject },
      { object: 'http://id.website.com/thing/comic-script', predicate: 'http://website.com/type-of-work', subject },
      { object: 'http://id.website.com/thing/keyword1', predicate: 'http://id.website.com/thing/keyword', subject },
      { object: 'http://id.website.com/thing/keyword2', predicate: 'http://id.website.com/thing/keyword', subject },
      { object: 'jupiter/helpful-slug-1234-789', predicate: 'http://website.com/id', subject },
      { object: '2011-12-19T15:28:46.493Z', predicate: 'http://website.com/updated', subject },
      { object: 'http://mysite.com/page/jupiter/helpful-slug-1234-789', predicate: 'http://website.com/homepage', subject },
  ];
  t.deepEqual(entity.triples, expectedTriples, 'should have correct triples');
  const expectedHistory = { id: 'jupiter/helpful-slug-1234-789',
    latest: {
      author: {
        name: 'Adele Smith',
        'twitter:username': '@adelesmith',
        url: 'http:/mysite.com/adele-smith' },
      description: 'some desc',
      headline: 'some headline',
      inLanguage: 'en',
      keywords: [
            { id: 'http://id.website.com/thing/keyword1' },
            { id: 'http://id.website.com/thing/keyword2' },
      ],
      license: {
        alternateName: 'CC BY',
        description: 'Creative Commons Attribution 4.0 International',
        name: 'CC BY 4.0',
        'twitter:hastag': '#CCBY',
        url: 'https://creativecommons.org/licenses/by/4.0/',
      },
      typeOfContribution: {
        name: 'writing',
        url: 'http://website.com/typeOfContribution/writing',
      },
      typeOfWork: {
        name: 'Comic Script',
        url: 'http://website.com/thing/comic-script',
      },
      url: 'http://mysite.com/page/jupiter/helpful-slug-1234-789',
    },
    updated: '2011-12-19T15:28:46.493Z',
    version: 'jupiter/helpful-slug-1234-789-56',
  };
  t.deepEqual(entity.history, expectedHistory, 'should have correct history');
});
