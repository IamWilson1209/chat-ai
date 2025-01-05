/* 
  remove https:// from identityTokenIdentifier string
*/
export const removeHttps = (identityTokenIdentifier: string): string => {
  const removedidentityTokenIdentifier = identityTokenIdentifier.replace(
    /^https:\/\//,
    ""
  );

  return removedidentityTokenIdentifier;
}