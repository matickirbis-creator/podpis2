export function mailSubject(formType: string, isPatient: boolean){
  if(formType==='implant') return isPatient ? 'Implant – vaš izpolnjen obrazec (PDF)' : 'Implant – izpolnjen obrazec pacienta (PDF)';
  if(formType==='protetika') return isPatient ? 'Protetika – vaš izpolnjen obrazec (PDF)' : 'Protetika – izpolnjen obrazec pacienta (PDF)';
  if(formType==='kirurski') return isPatient ? 'Kirurški – vaš izpolnjen obrazec (PDF)' : 'Kirurški – izpolnjen obrazec pacienta (PDF)';
  if(formType==='ekstrakcija') return isPatient ? 'Ekstrakcija – vaš izpolnjen obrazec (PDF)' : 'Ekstrakcija – izpolnjen obrazec pacienta (PDF)';
  return isPatient ? 'FDI – vaš izpolnjen obrazec (PDF)' : 'FDI – izpolnjen obrazec pacienta (PDF)';
}
