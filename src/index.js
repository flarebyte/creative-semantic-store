import Joi from 'joi';
import _ from 'lodash';
import path from 'path';
import fs from 'fs-extra';
import Multimap from 'multimap';
import Ajv from 'ajv';
import { readNTriplesFile,
   findObjectByPredicate,
   findObjectsByPredicate,
 } from 'ntriples-collection';

const historySchema = require('./history.schema.json');
const confSchema = require('./confSchema');

const ajv = new Ajv();

const validateHistory = ajv.compile(historySchema);

class CreativeSemanticStore {
  constructor(conf) {
    this.conf = conf;
    this.categoryMap = _.fromPairs(this.conf.appConfig.categoryMapping);
    this.typeOfContributionMap = _.fromPairs(this.conf.appConfig.typeOfContributionMapping);
    this.typeOfWorkMap = _.fromPairs(this.conf.appConfig.typeOfWorkMapping);
    this.activeHistory = {};
    this.activeVersions = [];
    this.activeTriples = {};
    this.categories = _.uniq(_.map(conf.appConfig.categoryMapping, _.last)).sort();
    _.forEach(this.categories, (c) => {
      this.activeTriples[c] = new Multimap();
    });
  }

  loadReadOnly(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  loadActive(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  saveActive(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  loadActiveCategoryTriples(opts, callback) {
    const filename = path.resolve(opts.folder, `${opts.category}.nt`);
    const activeCat = this.activeTriples[opts.category];
    readNTriplesFile(filename, (err, triples) => {
      if (err) {
        callback(err, false);
      } else {
        _.forEach(triples, t => activeCat.set(t.subject, t));
        callback(null, true);
      }
    });
  }

  loadActiveHistory(opts, callback) {
    const filename = path.resolve(opts.folder, 'history', `${opts.version}.history.json`);
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
    });
  }

  findCategory(couples) {
    const categorySrc = findObjectByPredicate(couples,
       this.conf.appConfig.categorySrcPredicate);
    return this.categoryMap[categorySrc];
  }

  findTypeOfContribution(couples) {
    const typeOfContribution = findObjectByPredicate(couples,
       this.conf.appConfig.typeOfContributionPredicate);
    return this.typeOfContributionMap[typeOfContribution];
  }

  findTypeOfWork(couples) {
    const typeOfWork = findObjectByPredicate(couples,
       this.conf.appConfig.typeOfWorkPredicate);
    return this.typeOfWorkMap[typeOfWork];
  }

  findKeywords(couples) {
    const keywords = findObjectsByPredicate(couples,
       this.conf.appConfig.keywordPredicate);
    return _.map(keywords, k => ({ id: k }));
  }

  insertEntity(opts) {
    const couples = opts.couples;
    const slug = opts.slug;
    const category = this.findCategory(couples);
    const prefix = this.conf.userConfig.activePrefix;
    const id = this.conf.appConfig.onGenerateId(slug, prefix, category);
    const homepage = this.conf.appConfig.onGenerateHomepage(slug, prefix, category);
    const version = this.conf.appConfig.onGenerateVersion(slug, prefix, category, id);
    const updatedTime = this.conf.appConfig.onUpdateTime();

    const headline = findObjectByPredicate(couples, this.conf.appConfig.headlinePredicate);
    const alternativeHeadline = findObjectByPredicate(couples,
       this.conf.appConfig.alternativeHeadlinePredicate);
    const description = findObjectByPredicate(couples, this.conf.appConfig.descriptionPredicate);
    const typeOfWork = this.findTypeOfWork(couples);
    const typeOfContribution = this.findTypeOfContribution(couples);
    const keywords = this.findKeywords(couples);

    const couple2triple = v =>
           ({ subject: version, predicate: v.predicate, object: v.object })
        ;
    const triples = _.map(couples, couple2triple);
    triples.push({ subject: version,
      predicate: this.conf.appConfig.idPredicate,
      object: id });
    triples.push({ subject: version,
      predicate: this.conf.appConfig.updatedPredicate,
      object: updatedTime });
    triples.push({ subject: version,
      predicate: this.conf.appConfig.homepagePredicate,
      object: homepage });
    this.activeVersions.push(version);
    const activeCat = this.activeTriples[category];
    activeCat.set(version, triples);
    const history = {
      id,
      version,
      updated: updatedTime,
      latest: {
        headline,
        url: homepage,
        inLanguage: this.conf.userConfig.activeLanguage,
        typeOfWork,
        typeOfContribution,
        license: this.conf.userConfig.activeLicense,
        keywords,
        author: this.conf.userConfig.activeAuthor,
      },
    };
    if (_.isString(alternativeHeadline)) {
      history.latest.alternativeHeadline = alternativeHeadline;
    }
    if (_.isString(description)) {
      history.latest.description = description;
    }
    return { triples, history };
  }

  updateEntity(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  deleteEntity(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  searchById(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  searchByVersionId(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  searchByType(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  searchByKeyword(callback) {
    this.readOnly = {};
    callback(null, true);
  }

  searchByText(callback) {
    this.readOnly = {};
    callback(null, true);
  }


}

/**
 * @param {Type}
 * @return {Type}
 */

export default function (conf) {
  const { error } = Joi.validate(conf, confSchema);
  if (error !== null) {
    throw error;
  }

  const datastore = new CreativeSemanticStore(conf);

  return datastore;
}
