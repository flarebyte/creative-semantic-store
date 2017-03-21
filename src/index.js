import Joi from "joi"
import _ from "lodash"
import path from "path"
import fs from "fs-extra"
import n3 from "n3"
import S from "string"
import Multimap from "multimap"
import Ajv from "ajv"
const n3Util = n3.Util;
const historySchema = require("./history.schema.json")
const ajv = new Ajv();

/**
 * @param {Type}
 * @return {Type}
 */

const n3parser = n3.Parser();
const n3parse = (str) => _.head(n3parser.parse(str));

const validateHistory = ajv.compile(historySchema);

const mediumString = Joi.string().min(1).max(120);
const pathString = Joi.string().max(1000);
const anyUrl = Joi.string().uri({scheme: ['http','https']}).max(1000);
const authorSchema = Joi.object().keys({
   name: mediumString,
   url: anyUrl,
   'twitter:username': mediumString
});

const licenseSchema = Joi.object().keys({
   name: mediumString,
   alternateName: mediumString,
   description: mediumString,
   url: anyUrl,
   'twitter:hastag': mediumString
});

 const userConfigSchema = Joi.object().keys({
    folders: Joi.array().items(pathString).unique().max(100),
    activeFolder: pathString,
    activePrefix: mediumString.required(),
    activeAuthor: authorSchema,
    activeLicense: licenseSchema,
    activeLanguage: Joi.string().length(2)
});
const categoryMappingSchema = Joi.array().items(mediumString).length(2);

const appConfigSchema = Joi.object().keys({
   categoryMapping: Joi.array().items(categoryMappingSchema).unique().min(1).max(1000).required(),
   categorySrcPredicate: anyUrl,
   onGenerateVersion: Joi.func().required(),
   onGenerateId: Joi.func().required(),
   onUpdateTime: Joi.func().required(),
   idPredicate: anyUrl,
   updatedPredicate: anyUrl,
});

const confSchema = Joi.object().keys({
   userConfig: userConfigSchema.required(),
   appConfig: appConfigSchema.required(),
}).required();

const isTriple = (str) => S(str).contains("<")

const readNTriplesFile = (filename, callback) => {
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
      callback(err);
    } else {
      const lines = _.filter(S(data).lines(), isTriple);
      const triples = _.map(lines, n3parse);
      callback(null, triples);
    }
});
}

const findObjectByPredicate = (triples, predicate) => n3Util.getLiteralValue(_.get(_.find(triples, {predicate}),'object'));

class CreativeSemanticStore {
    constructor(conf) {
        this.conf = conf;
        this.categoryMap = _.fromPairs(this.conf.appConfig.categoryMapping);
        this.activeHistory = {};
        this.activeVersions = [];
        this.activeTriples = {};
        this.categories = _.uniq(_.map(conf.appConfig.categoryMapping, _.last)).sort();
        _.forEach(this.categories, (c) => this.activeTriples[c] = new Multimap());
    }

    loadReadOnly(callback) {
        callback(null, true);
    }

    loadActive(callback) {
        callback(null, true);
    }

    saveActive(callback) {
        callback(null, true);
    }

    loadActiveCategoryTriples(opts, callback) {
        const filename = path.resolve(opts.folder, `${opts.category}.nt`)
        const activeCat = this.activeTriples[opts.category];
        readNTriplesFile(filename, (err, triples)=> {
          if (err) {
            callback(err, false);
          } else {
            _.forEach(triples, (t) => activeCat.set(t.subject, t));
            callback(null, true);
          }
        });
    }

    loadActiveHistory(opts, callback) {
        const filename = path.resolve(opts.folder, "history", `${opts.version}.history.json`)
        fs.readJson(filename, (err, history) => {
          if (err) {
            callback(err);
          } else {
            const valid = validateHistory(history);
            if (valid) {
              this.activeHistory[opts.version] = history;
              callback(null, true);
            } else {
              callback(validateHistory.errors);
            }
          }
        })
    }

    findCategory(couples) {
      const categorySrc = findObjectByPredicate(couples, this.conf.appConfig.categorySrcPredicate);
      return this.categoryMap[categorySrc];
    }

    insertEntity(opts) {
        const couples = opts.couples;
        const slug = opts.slug;
        const category = this.findCategory(couples);
        const prefix = this.conf.userConfig.activePrefix;
        const id = this.conf.appConfig.onGenerateId(slug, prefix, category);
        const version = this.conf.appConfig.onGenerateVersion(slug, prefix, category, id);
        const updatedTime =  this.conf.appConfig.onUpdateTime();
        const couple2triple = (v) => {
          return {subject: version, predicate: v.predicate, object: v.object};
        }
        const triples = _.map(couples, couple2triple);
        triples.push({subject: version,
           predicate: this.conf.appConfig.idPredicate,
           object: id});
        triples.push({subject: version,
            predicate: this.conf.appConfig.updatedPredicate,
            object: updatedTime});
        this.activeVersions.push(version);
        const activeCat = this.activeTriples[category];
        activeCat.set(version, triples);
        return {triples};
    }

    updateEntity(callback) {
        callback(null, true);
    }

    deleteEntity(callback) {
        callback(null, true);
    }

    searchById(callback) {
        callback(null, true);
    }

    searchByVersionId(callback) {
        callback(null, true);
    }

    searchByType(callback) {
        callback(null, true);
    }

    searchByKeyword(callback) {
        callback(null, true);
    }

    searchByText(callback) {
        callback(null, true);
    }


};

export default function (conf) {
  const {error, value} = Joi.validate(conf, confSchema);
  if (error !== null) {
    throw error;
  }

  const datastore = new CreativeSemanticStore(conf);

  return datastore
}
