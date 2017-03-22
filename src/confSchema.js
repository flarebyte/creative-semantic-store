import Joi from "joi"

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

const refSchema = Joi.object().keys({
   name: mediumString,
   url: anyUrl,
});

const categoryMappingSchema = Joi.array().items(mediumString).length(2);
const typeOfKeyRefSchema = Joi.array().items(mediumString, Joi.object()).length(2);

const appConfigSchema = Joi.object().keys({
   categoryMapping: Joi.array().items(categoryMappingSchema).unique().min(1).max(1000).required(),
   typeOfContributionMapping: Joi.array().items(typeOfKeyRefSchema).unique().min(1).max(1000).required(),
   typeOfWorkMapping: Joi.array().items(typeOfKeyRefSchema).unique().min(1).max(1000).required(),
   categorySrcPredicate: anyUrl,
   onGenerateVersion: Joi.func().required(),
   onGenerateId: Joi.func().required(),
   onGenerateHomepage: Joi.func().required(),
   onUpdateTime: Joi.func().required(),
   idPredicate: anyUrl,
   updatedPredicate: anyUrl,
   headlinePredicate: anyUrl,
   alternativeHeadlinePredicate: anyUrl,
   descriptionPredicate: anyUrl,
   homepagePredicate: anyUrl,
   typeOfWorkPredicate: anyUrl,
   typeOfContributionPredicate: anyUrl,
   keywordPredicate: anyUrl,
});

const confSchema = Joi.object().keys({
   userConfig: userConfigSchema.required(),
   appConfig: appConfigSchema.required(),
}).required();


module.exports=confSchema;
