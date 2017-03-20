import test from "tape"
import path from "path"
import _ from "lodash"
import creativeSemanticStore from "../src"

const activeDir = path.resolve(__dirname, 'fixtures', 'active')

const activeLicense =  {
      "url":"https://creativecommons.org/licenses/by/4.0/",
      "description":"Creative Commons Attribution 4.0 International",
      "name":"CC BY 4.0",
      "twitter:hastag":"#CCBY",
      "alternateName":"CC BY"
};

const activeAuthor = {
      "name":"Adele Smith",
      "url":"http:/mysite.com/adele-smith",
      "twitter:username":"@adelesmith"
};

const onGenerateId = (prefix, category) => {
  return `${category}/${prefix}-789`;
};

const onGenerateVersion = (prefix, category, id) => {
  return `${id}-56`;
};


const categoryMapping = [['aphrodite','venus'],['beauty','venus'],['zeus','jupiter']]

const conf = {
  userConfig: {
    folders: ["/proj1","/proj2/alpha"],
    activeFolder : "active",
    activePrefix : "1234",
    activeAuthor,
    activeLicense,
    activeLanguage: "en"
  },

  appConfig: {
    categoryMapping,
    categorySrcPredicate: "http://website.com/typeOfWork",
    idPredicate: "http://website.com/id",
    onGenerateId,
    onGenerateVersion,
  }
};
test("creativeSemanticStore should validate config", (t) => {
  t.plan(1)
  t.notEqual(creativeSemanticStore(conf), null, "return a store")
})

test("creativeSemanticStore should load a category", (t) => {
  const store = creativeSemanticStore(conf);
  const opts = {category: 'venus', folder: activeDir};
  t.plan(4)
  store.loadActiveCategoryTriples(opts, (err, success)=> {
    t.ok(success, "should be successful");
    t.equal(_.size(store.activeTriples.venus), 2, 'should have the exact number of subject sections');
    t.deepEqual(store.categories, ['jupiter','venus'], 'should have categories');
    t.deepEqual(store.activeTriples.venus.get('http://www.site.org/version/125/'),
     [ { graph: '', object: '"Dave Beckett"',
      predicate: 'http://purl.org/dc/elements/1.1/creator',
      subject: 'http://www.site.org/version/125/' },
      { graph: '', object: '"Art Barstow"',
        predicate: 'http://purl.org/dc/elements/1.1/creator',
        subject: 'http://www.site.org/version/125/' },
      { graph: '', object: 'http://www.w3.org/',
        predicate: 'http://purl.org/dc/elements/1.1/publisher',
        subject: 'http://www.site.org/version/125/' }
      ]);
    });
  });

  test("creativeSemanticStore should load an active history for version", (t) => {
    const store = creativeSemanticStore(conf);
    const opts = {version: '125', folder: activeDir};
    t.plan(2)
    store.loadActiveHistory(opts, (err, success)=> {
      t.ok(success, "should be successful");
      t.equal(store.activeHistory['125'].history[0].headline, "London gathering")
      });
    });

  test("creativeSemanticStore should insert entity", (t) => {
    const store = creativeSemanticStore(conf);
    const opts = {couples: [
      {predicate: "http:/a.com/a", object: '"a"'},
      {predicate: "http://website.com/typeOfWork", object: '"zeus"'},
      {predicate: "http:/a.com/b", object: '"b"'},
      {predicate: "http:/a.com/c", object: '"c"'}
    ]};
    t.plan(1)
    const entity = store.insertEntity(opts);
    const expected = [
      { object: '"a"', predicate: 'http:/a.com/a', subject: 'jupiter/1234-789-56' },
      { object: '"zeus"', predicate: 'http://website.com/typeOfWork', subject: 'jupiter/1234-789-56' },
      { object: '"b"', predicate: 'http:/a.com/b', subject: 'jupiter/1234-789-56' },
      { object: '"c"', predicate: 'http:/a.com/c', subject: 'jupiter/1234-789-56' },
      { object: 'jupiter/1234-789', predicate: 'http://website.com/id', subject: 'jupiter/1234-789-56' }
     ];
    t.deepEqual(entity.triples, expected, "should have correct triples");
    });
