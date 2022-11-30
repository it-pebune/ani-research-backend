import { SubjectDao, UatDao } from '~daos';
import app from '~app';
import { createHash } from 'crypto';
import { ISubjectDTO, IWSMPListResponse } from '~entities';

/**
 * @param {ISubjectDTO} subject
 * @return {Promise<string>}
 */
export async function computeSubjectHash(subject: ISubjectDTO): Promise<string> {
  const uatDao = new UatDao(await app.sqlPool);
  const uat = await uatDao.getUatWithCounty(subject.sirutaId);

  return createHash('sha1')
    .update(subject.lastName.toLowerCase() + ' ' + subject.firstName.toLowerCase())
    .update(uat?.county?.name.toLowerCase() ?? '')
    .digest('hex');
}

/**
 * @param {IWSMPListResponse} scrappedSubjects
 */
export async function markAddedSubjects(scrappedSubjects: IWSMPListResponse): Promise<void> {
  const hashes: string[] = [];

  for (const scrappedSubject of scrappedSubjects.results) {
    const hash = createHash('sha1')
      .update(scrappedSubject.name.toLowerCase())
      .update(scrappedSubject.district?.toLowerCase())
      .digest('hex');

    scrappedSubject.hash = hash;
    hashes.push(hash);
  }

  const subjectDao = new SubjectDao(await app.sqlPool);
  const subjectIdsByHashes = await subjectDao.getSubjectsWithHashes(hashes);

  for (const scrappedSubject of scrappedSubjects.results) {
    scrappedSubject.added = typeof subjectIdsByHashes[scrappedSubject.hash] !== 'undefined';
  }
}
