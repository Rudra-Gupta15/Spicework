/**
 * The signed-in account. A login belongs to a company, not to a person —
 * there is one account per organization and everyone inside it works under
 * the same tenant, so the header and sidebar identify the company rather
 * than a job title. Swap for the tenant returned by auth.
 */
export interface CurrentCompany {
  id: string;
  name: string;
  /** Mail domain the organization's addresses hang off. */
  domain: string;
  /** Sits under the name — what the account *is*, not who is using it. */
  accountType: string;
  industry: string;
  email: string;
}

const NAME = "Prevoyance IT Solutions";
const DOMAIN = "prevoyancesolutions.com";

export const CURRENT_COMPANY: CurrentCompany = {
  id: "org-prevoyance",
  name: NAME,
  domain: DOMAIN,
  accountType: "Organization Account",
  industry: "Information Technology",
  email: `admin@${DOMAIN}`,
};
