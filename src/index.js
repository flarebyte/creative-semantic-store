const Joi = require('joi');
const _ = require('lodash');
/**
 * @param {Type}
 * @return {Type}
 */

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
   onInsertEntity: Joi.func().required(),
   onUpdateEntity: Joi.func().required()
});

const confSchema = Joi.object().keys({
   userConfig: userConfigSchema.required(),
   appConfig: appConfigSchema.required()
}).required();

export default function (conf) {
  const {error, value} = Joi.validate(conf, confSchema);
  if (error !== null) {
    throw error;
  }

  const datastore = {};

  return datastore
}
