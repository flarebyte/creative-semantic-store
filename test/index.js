import test from "tape"
import creativeSemanticStore from "../src"

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
