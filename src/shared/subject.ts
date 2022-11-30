import { UatDao } from '~daos';
import app from '~app';
import { createHash } from 'crypto';
import { ISubjectDTO } from '~entities';

/**
 * @param {ISubjectDTO} subject
 * @return {Promise<string>}
 */
export async function computeHash(subject: ISubjectDTO): Promise<string> {
  const uatDao = new UatDao(await app.sqlPool);
  const uat = await uatDao.getUatWithCounty(subject.sirutaId);

  return createHash('sha1')
    .update(subject.firstName.toLowerCase())
    .update(subject.lastName.toLowerCase())
    .update(uat?.county?.name.toLowerCase() ?? '')
    .digest('hex');
}
