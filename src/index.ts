import * as dotenv from 'dotenv';
import { ManageAPI } from 'connectwise-rest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const {
  CWM_PRIVATE_KEY,
  CWM_PUBLIC_KEY,
  CWM_BASEURL,
  CWM_COMPANY,
  CW_CLIENTID,
  CW_DEBUG,
} = process.env;

const Manage = new ManageAPI({
  companyId: String(CWM_COMPANY),
  clientId: String(CW_CLIENTID),
  companyUrl: String(CWM_BASEURL),
  publicKey: String(CWM_PUBLIC_KEY),
  privateKey: String(CWM_PRIVATE_KEY),
  debug: Boolean(CW_DEBUG),
  timeout: 50000,
});

async function main() {
  let csvData = 'company, site, address1, address2, city, state, zip, phone\n';
  writeFileSync('./sites.csv', csvData, { flag: 'w' });
  Manage.CompanyAPI.getCompanyCompanies({ conditions: 'status/id=1', childConditions: 'types/id=1 OR types/id=35 OR types/id=39', pageSize: 200, orderBy: 'name asc' })
  .then((companies) => {
    companies.forEach(async (company) => {
      const companyId : number = company.id!;
      Manage.CompanyAPI.getCompanyCompaniesByParentIdSites(companyId, { conditions: 'inactiveFlag=false', pageSize: 1000 }).then((sites) => {
        sites.forEach((site) => {
          const siteRow = `"${company.name.replace(',','')}", ${site.name}, ${site.addressLine1?.replace(',','')}, ${site.addressLine2?.replace(',','')}, ${site.city}, ${site.stateReference?.identifier}, ${site.zip}, ${site.phoneNumber}\n`;
          writeFileSync('./sites.csv', siteRow, { flag: 'a+' });
        });
      });
    });
  });

}
main();