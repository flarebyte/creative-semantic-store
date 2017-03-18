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
const onInsertEntity = (value) => {
  return value;
};
const onUpdateEntity = (value) => {
  return value;
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
    onInsertEntity,
    onUpdateEntity
  }
};
test("creativeSemanticStore should validate config", (t) => {
  t.plan(1)
  t.notEqual(creativeSemanticStore(conf), null, "return a store")
})

test("creativeSemanticStore should load a category", (t) => {
  const store = creativeSemanticStore(conf);
  const opts = {category: 'venus', folder: activeDir};
  t.plan(3)
  store.loadActiveCategoryTriples(opts, (err, success)=> {
    t.ok(success, "should be successful");
    t.equal(_.size(store.activeTriples.venus), 3, 'should have the exact number of triples');
    t.deepEqual(store.activeTriples.venus[0], { graph: '',
     object: '"Dave Beckett"',
     predicate: 'http://purl.org/dc/elements/1.1/creator',
     subject: 'http://www.w3.org/2001/sw/RDFCore/ntriples/'});
  })

})
