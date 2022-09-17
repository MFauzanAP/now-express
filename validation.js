const { Verifier } = require('academic-email-verifier');

async function getInstitutionName(email){
  return Verifier.getInstitutionName(email);
}
function validateEmail(email){
    return Verifier.isValidEmailAddress(email) //&& await Verifier.isAcademic(email);
}

module.exports = {validateEmail,getInstitutionName};